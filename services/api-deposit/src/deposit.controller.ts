import {
	ResponseBuilder,
	ErrorCode,
	ApiResponse,
	ApiHandler,
	ApiEvent,
	ApiContext,
	UnitOfWork,
	SharedFunctions,
	LastEvaluatedKey
} from '../../api-shared-modules/src';
import { Deposit, PaymentIntent, Transaction, User } from '@moneyshare/common-types';
import Stripe from 'stripe';

export class DepositController {

	public constructor(
		private unitOfWork: UnitOfWork,
		private stripe: Stripe
	) { }

	public getAllDeposits: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<ApiResponse> => {
		let lastEvaluatedKey: LastEvaluatedKey;
		const data: any = JSON.parse(event.body);

		if (data && data.lastEvaluatedKey) {
			const { pk, sk, sk2, entity }: LastEvaluatedKey = data.lastEvaluatedKey;
			lastEvaluatedKey = {
				pk,
				sk,
				sk2,
				entity
			};
		}

		try {
			const userId: string = SharedFunctions.getUserIdFromAuthProvider(event);
			const user: User = await this.unitOfWork.Users.getById(userId);
			if (!user) return ResponseBuilder.notFound(ErrorCode.InvalidId, 'User Not Found');

			const result: { deposits: Deposit[]; lastEvaluatedKey: Partial<LastEvaluatedKey> } =
				await this.unitOfWork.Deposits.getAll(userId, 10, lastEvaluatedKey);
			if (!result) return ResponseBuilder.notFound(ErrorCode.GeneralError, 'Failed to retrieve Deposits');

			return ResponseBuilder.ok({ ...result, count: result.deposits.length });
		} catch (err) {
			return ResponseBuilder.internalServerError(err, err.message);
		}
	}

	public depositBegin: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<ApiResponse> => {
		if (!event.pathParameters || !event.pathParameters.amount)
			return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Invalid request parameters');
		const amount: number = parseInt(event.pathParameters.amount, 10);

		if (!amount) return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Deposit Amount is Missing');
		if (amount < 1000) return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Minimum 10 Euro Deposit');
		if (amount > 50000) return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Maximum 500 Euro Deposit');

		try {
			const userId: string = SharedFunctions.getUserIdFromAuthProvider(event);
			const user: User = await this.unitOfWork.Users.getById(userId);
			if (!user) return ResponseBuilder.notFound(ErrorCode.InvalidId, 'User not found');

			const paymentIntent: Stripe.PaymentIntent = await this.stripe.paymentIntents.create({
				amount,
				currency: 'eur',
				metadata: { integration_check: 'accept_a_payment' }
			});

			await this.unitOfWork.PaymentIntents.create(userId, paymentIntent);

			return ResponseBuilder.ok({ clientSecret: paymentIntent.client_secret });
		} catch (err) {
			console.log(err);
			return ResponseBuilder.internalServerError(err, err.message);
		}
	}

	public depositComplete: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<ApiResponse> => {
		if (!event.body) return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Invalid request body');

		const data: Partial<PaymentIntent> = JSON.parse(event.body) as Partial<PaymentIntent>;

		try {
			const userId: string = SharedFunctions.getUserIdFromAuthProvider(event);
			const user: User = await this.unitOfWork.Users.getById(userId);
			if (!user) return ResponseBuilder.notFound(ErrorCode.InvalidId, 'User Not Found');

			const paymentIntent: PaymentIntent = await this.unitOfWork.PaymentIntents.complete(data.clientSecret, userId);
			if (!paymentIntent) return ResponseBuilder.notFound(ErrorCode.InvalidId, 'Unable to update Account Balance');

			const amount: number = Number(paymentIntent.amount);

			user.accountBalance = (user.accountBalance || 0) + amount;
			await this.unitOfWork.Users.update(user.userId, user);

			const deposit: Partial<Deposit> = {
				amount
			};

			const dep: Deposit = await this.unitOfWork.Deposits.create(userId, deposit);

			const transaction: Partial<Transaction> = {
				type: 'DEPOSIT',
				amount,
				newBalance: user.accountBalance,
				text: `You deposited €${(amount / 100).toFixed(2)}`,
				accessKey: {
					pk: dep.pk,
					sk: dep.sk
				}
			};

			await this.unitOfWork.Transactions.create(userId, transaction);

			return ResponseBuilder.ok({ });
		} catch (err) {
			console.log(err);
			return ResponseBuilder.internalServerError(err, err.message);
		}
	}

}
