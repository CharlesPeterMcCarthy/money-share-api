import { Transaction } from '@moneyshare/common-types';
import { LastEvaluatedKey } from '../../types';
import { TransactionItem } from '../../models/core';

export interface ITransactionRepository {
	getAll(userId: string, lastEvaluatedKey?: LastEvaluatedKey): Promise<{ transactions: Transaction[]; lastEvaluatedKey: Partial<TransactionItem> }>;
	create(userId: string, transaction: Partial<Transaction>): Promise<Transaction>;
}
