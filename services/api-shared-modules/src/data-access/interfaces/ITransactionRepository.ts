import { Transaction } from '@moneyshare/common-types';

export interface ITransactionRepository {
	// get(clientSecret: string, userId: string): Promise<PaymentIntent>;
	create(userId: string, transaction: Partial<Transaction>): Promise<Transaction>;
	// complete(clientSecret: string, userId: string): Promise<PaymentIntent>;
}
