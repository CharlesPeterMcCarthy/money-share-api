import { Repository } from './Repository';
import { Transaction } from '@moneyshare/common-types';
import { TransactionItem } from '../../models/core';
import { v4 as uuid } from 'uuid';
import { LastEvaluatedKey } from '../../types';
import { QueryKey } from '../interfaces';
import { QueryOptions, QueryPaginator } from '@aws/dynamodb-data-mapper';

export class TransactionRepository extends Repository {

	public async getAll(userId: string, lastEvaluatedKey?: LastEvaluatedKey): Promise<{ transactions: Transaction[]; lastEvaluatedKey: Partial<TransactionItem> }> {
		const keyCondition: QueryKey = {
			entity: 'transaction',
			sk: `user#${userId}`
		};
		const queryOptions: QueryOptions = {
			indexName: 'entity-sk-index',
			scanIndexForward: false,
			startKey: lastEvaluatedKey,
			limit: 10
		};

		const queryPages: QueryPaginator<TransactionItem> = this.db.query(TransactionItem, keyCondition, queryOptions).pages();
		const transactions: Transaction[] = [];
		for await (const page of queryPages) {
			for (const transaction of page)
				transactions.push(transaction);
		}
		return {
			transactions,
			lastEvaluatedKey:
				queryPages.lastEvaluatedKey ?
					queryPages.lastEvaluatedKey :
					undefined
		};
	}

	public async create(userId: string, transaction: Partial<Transaction>): Promise<Transaction> {
		const date: string = new Date().toISOString();
		const transactionId: string = uuid();

		return this.db.put(Object.assign(new TransactionItem(), {
			transactionId,
			pk: `transaction#${transactionId}`,
			sk: `user#${userId}`,
			sk2: `createdAt#${date}`,
			entity: 'transaction',
			times: {
				createdAt: date
			},
			...transaction
		}));
	}

}
