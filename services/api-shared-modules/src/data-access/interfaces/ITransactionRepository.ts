import { Transaction } from '@moneyshare/common-types';
import { LastEvaluatedKey } from '../../types';
import { TransactionItem } from '../../models/core';

export interface ITransactionRepository {
	getAll(userId: string, limit?: number, lastEvaluatedKey?: LastEvaluatedKey): Promise<{ transactions: Transaction[]; lastEvaluatedKey: Partial<TransactionItem> }>;
	getLast(userId: string, limit: number): Promise<Transaction[]>;
	create(userId: string, transaction: Partial<Transaction>): Promise<Transaction>;
}
