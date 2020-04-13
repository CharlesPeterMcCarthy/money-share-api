import {
	UserRepository,
	SubscriptionRepository,
} from './repositories';
import {
	IUserRepository,
	ISubscriptionRepository,
} from './interfaces';
import { DataMapper } from '@aws/dynamodb-data-mapper';
import { DynamoDB } from 'aws-sdk';
import { IPaymentIntentRepository } from './interfaces/IPaymentIntentRepository';
import { PaymentIntentRepository } from './repositories/PaymentIntentRepository';

export class UnitOfWork {

	public Users: IUserRepository;
	public Subscriptions: ISubscriptionRepository;
	public PaymentIntents: IPaymentIntentRepository;

	public constructor() {
		const db: DataMapper = new DataMapper({ client: new DynamoDB({ region: 'eu-west-1' }) });

		this.Users = new UserRepository(db);
		this.Subscriptions = new SubscriptionRepository(db);
		this.PaymentIntents = new PaymentIntentRepository(db);
	}

}
