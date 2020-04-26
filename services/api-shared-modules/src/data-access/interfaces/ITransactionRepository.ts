import { Transaction } from '@moneyshare/common-types';
import { LastEvaluatedKey } from '../../types';

export interface ITransactionRepository {
	getAll(userId: string, limit?: number, lastEvaluatedKey?: LastEvaluatedKey): Promise<{ transactions: Transaction[]; lastEvaluatedKey: Partial<LastEvaluatedKey> }>;
	getLast(userId: string, limit: number): Promise<Transaction[]>;
	create(userId: string, transaction: Partial<Transaction>): Promise<Transaction>;
}
