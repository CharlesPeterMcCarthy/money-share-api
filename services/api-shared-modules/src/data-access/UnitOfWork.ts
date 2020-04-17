import {
	UserRepository,
	SubscriptionRepository, TransactionRepository, PaymentIntentRepository, DepositRepository, TransferRepository,
} from './repositories';
import {
	IUserRepository,
	ISubscriptionRepository, ITransactionRepository, IPaymentIntentRepository, IDepositRepository, IWithdrawRepository, ITransferRepository,
} from './interfaces';
import { DataMapper } from '@aws/dynamodb-data-mapper';
import { DynamoDB } from 'aws-sdk';
import { WithdrawRepository } from './repositories/WithdrawRepository';

export class UnitOfWork {

	public Users: IUserRepository;
	public Subscriptions: ISubscriptionRepository;
	public PaymentIntents: IPaymentIntentRepository;
	public Transactions: ITransactionRepository;
	public Deposits: IDepositRepository;
	public Withdrawals: IWithdrawRepository;
	public Transfers: ITransferRepository;

	public constructor() {
		const db: DataMapper = new DataMapper({ client: new DynamoDB({ region: 'eu-west-1' }) });

		this.Users = new UserRepository(db);
		this.Subscriptions = new SubscriptionRepository(db);
		this.PaymentIntents = new PaymentIntentRepository(db);
		this.Transactions = new TransactionRepository(db);
		this.Deposits = new DepositRepository(db);
		this.Withdrawals = new WithdrawRepository(db);
		this.Transfers = new TransferRepository(db);
	}

}
