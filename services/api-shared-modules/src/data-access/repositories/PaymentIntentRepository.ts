import { Repository } from './Repository';
import { PaymentIntent } from '@moneyshare/common-types';
import { PaymentIntentItem } from '../../models/core/PaymentIntent';
import Stripe from 'stripe';

export class PaymentIntentRepository extends Repository {

	public async get(clientSecret: string, userId: string): Promise<PaymentIntent> {
		return this.db.get(Object.assign(new PaymentIntentItem(), {
			pk: `paymentIntent#${clientSecret}`,
			sk: `user#${userId}`
		}));
	}

	public async create(userId: string, paymentIntent: Stripe.PaymentIntent): Promise<PaymentIntent> {
		const date: string = new Date().toISOString();

		return this.db.put(Object.assign(new PaymentIntentItem(), {
			userId,
			pk: `paymentIntent#${paymentIntent.client_secret}`,
			sk: `user#${userId}`,
			entity: 'paymentIntent',
			id: paymentIntent.id,
			clientSecret: paymentIntent.client_secret,
			amount: paymentIntent.amount,
			transactionComplete: false,
			times: {
				createdAt: date
			}
		}));
	}

	public async complete(clientSecret: string, userId: string): Promise<PaymentIntent> {
		return this.db.update(Object.assign(new PaymentIntentItem(), {
			pk: `paymentIntent#${clientSecret}`,
			sk: `user#${userId}`,
			transactionComplete: true
		}), {
			onMissing: 'skip'
		});
	}

}
