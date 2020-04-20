import { Repository } from './Repository';
import { Transaction } from '@moneyshare/common-types';
import { TransactionItem } from '../../models/core';
import { v4 as uuid } from 'uuid';
import { LastEvaluatedKey } from '../../types';
import { QueryKey } from '../interfaces';
import { QueryOptions, QueryPaginator } from '@aws/dynamodb-data-mapper';
import { beginsWith } from '@aws/dynamodb-expressions';

export class TransactionRepository extends Repository {

	public async getAll(userId: string, limit?: number, lastEvaluatedKey?: LastEvaluatedKey): Promise<{ transactions: Transaction[]; lastEvaluatedKey: Partial<TransactionItem> }> {
		const keyCondition: QueryKey = {
			entity: 'transaction',
			sk2: beginsWith(`user#${userId}`)
		};
		const queryOptions: QueryOptions = {
			indexName: 'entity-sk2-index',
			scanIndexForward: false,
			startKey: lastEvaluatedKey
		};

		if (limit) queryOptions.limit = limit;

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

	public async getLast(userId: string, limit: number): Promise<Transaction[]> {
		const keyCondition: QueryKey = {
			entity: 'transaction',
			sk2: beginsWith(`user#${userId}`)
		};
		const queryOptions: QueryOptions = {
			indexName: 'entity-sk2-index',
			scanIndexForward: false,
			limit
		};

		const queryPages: QueryPaginator<TransactionItem> = this.db.query(TransactionItem, keyCondition, queryOptions).pages();
		const transactions: Transaction[] = [];
		for await (const page of queryPages) {
			for (const transaction of page)
				transactions.push(transaction);
		}
		return transactions;
	}

	public async create(userId: string, transaction: Partial<Transaction>): Promise<Transaction> {
		const date: string = new Date().toISOString();
		const transactionId: string = uuid();

		return this.db.put(Object.assign(new TransactionItem(), {
			transactionId,
			pk: `transaction#${transactionId}`,
			sk: `user#${userId}`,
			sk2: `user#${userId}/createdAt#${date}`,
			entity: 'transaction',
			times: {
				createdAt: date
			},
			...transaction
		}));
	}

}
