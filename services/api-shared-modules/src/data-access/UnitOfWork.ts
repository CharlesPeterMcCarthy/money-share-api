import {
	UserRepository,
	SubscriptionRepository, TransactionRepository, PaymentIntentRepository, DepositRepository,
} from './repositories';
import {
	IUserRepository,
	ISubscriptionRepository, ITransactionRepository, IPaymentIntentRepository, IDepositRepository,
} from './interfaces';
import { DataMapper } from '@aws/dynamodb-data-mapper';
import { DynamoDB } from 'aws-sdk';

export class UnitOfWork {

	public Users: IUserRepository;
	public Subscriptions: ISubscriptionRepository;
	public PaymentIntents: IPaymentIntentRepository;
	public Transactions: ITransactionRepository;
	public Deposits: IDepositRepository;

	public constructor() {
		const db: DataMapper = new DataMapper({ client: new DynamoDB({ region: 'eu-west-1' }) });

		this.Users = new UserRepository(db);
		this.Subscriptions = new SubscriptionRepository(db);
		this.PaymentIntents = new PaymentIntentRepository(db);
		this.Transactions = new TransactionRepository(db);
		this.Deposits = new DepositRepository(db);
	}

}
