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
import { User } from '@moneyshare/common-types';
import Stripe from 'stripe';

export class StripeController {

	public constructor(
		private unitOfWork: UnitOfWork,
		private stripe: Stripe
	) { }

	public createPaymentIntent: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<ApiResponse> => {
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

}
