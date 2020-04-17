import {
	ResponseBuilder,
	ErrorCode,
	ApiResponse,
	ApiHandler,
	ApiEvent,
	ApiContext,
	UnitOfWork,
	SharedFunctions
} from '../../api-shared-modules/src';
import { Transaction, User, Withdrawal } from '@moneyshare/common-types';

export class WithdrawController {

	public constructor(
		private unitOfWork: UnitOfWork
	) { }

	public withdraw: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<ApiResponse> => {
		if (!event.pathParameters || !event.pathParameters.amount)
			return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Invalid request parameters');
		const amount: number = parseInt(event.pathParameters.amount, 10);

		if (!amount) return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Deposit Amount is Missing');
		if (amount < 500) return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Minimum 5 Euro Withdrawal');
		if (amount > 35000) return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Maximum 350 Euro Withdrawal');

		try {
			const userId: string = SharedFunctions.getUserIdFromAuthProvider(event);
			const user: User = await this.unitOfWork.Users.getById(userId);
			if (!user) return ResponseBuilder.notFound(ErrorCode.InvalidId, 'User not found');

			// Pretend payout through Stripe occurs

			if (amount > user.accountBalance) return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Insufficient Funds');

			user.accountBalance = (user.accountBalance || 0) - amount;
			await this.unitOfWork.Users.update(user.userId, user);

			const withdrawal: Partial<Withdrawal> = {
				amount
			};

			const wi: Withdrawal = await this.unitOfWork.Withdrawals.create(userId, withdrawal);

			const transaction: Partial<Transaction> = {
				type: 'WITHDRAW',
				amount,
				newBalance: user.accountBalance,
				text: `You withdrew €${(amount / 100).toFixed(2)}`,
				accessKey: {
					pk: wi.pk,
					sk: wi.sk
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
