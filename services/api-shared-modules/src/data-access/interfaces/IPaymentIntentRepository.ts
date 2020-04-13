import Stripe from 'stripe';
import { PaymentIntent } from '@moneyshare/common-types';

export interface IPaymentIntentRepository {
	get(clientSecret: string, userId: string): Promise<PaymentIntent>;
	create(userId: string, paymentIntent: Stripe.PaymentIntent): Promise<PaymentIntent>;
	complete(clientSecret: string, userId: string): Promise<PaymentIntent>;
}
