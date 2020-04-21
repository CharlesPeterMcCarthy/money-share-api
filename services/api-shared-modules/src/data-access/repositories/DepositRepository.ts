import { Repository } from './Repository';
import { Deposit } from '@moneyshare/common-types';
import { DepositItem } from '../../models/core';
import { v4 as uuid } from 'uuid';
import { LastEvaluatedKey } from '../../types';
import { QueryKey } from '../interfaces';
import { beginsWith } from '@aws/dynamodb-expressions';
import { QueryOptions, QueryPaginator } from '@aws/dynamodb-data-mapper';

export class DepositRepository extends Repository {

	public async getAll(userId: string, limit?: number, lastEvaluatedKey?: LastEvaluatedKey): Promise<{ deposits: Deposit[]; lastEvaluatedKey: Partial<DepositItem> }> {
		const keyCondition: QueryKey = {
			entity: 'deposit',
			sk: beginsWith(`user#${userId}`)
		};
		const queryOptions: QueryOptions = {
			indexName: 'entity-sk-index',
			scanIndexForward: false,
			startKey: lastEvaluatedKey
		};

		if (limit) queryOptions.limit = limit;

		const queryPages: QueryPaginator<DepositItem> = this.db.query(DepositItem, keyCondition, queryOptions).pages();
		const deposits: Deposit[] = [];
		for await (const page of queryPages) {
			for (const deposit of page)
				deposits.push(deposit);
		}
		return {
			deposits,
			lastEvaluatedKey:
				queryPages.lastEvaluatedKey ?
					queryPages.lastEvaluatedKey :
					undefined
		};
	}

	public async create(userId: string, deposit: Partial<Deposit>): Promise<Deposit> {
		const date: string = new Date().toISOString();
		const depositId: string = uuid();

		return this.db.put(Object.assign(new DepositItem(), {
			depositId,
			pk: `deposit#${depositId}`,
			sk: `user#${userId}/createdAt#${date}`,
			sk2: `createdAt#${date}`,
			entity: 'deposit',
			times: {
				createdAt: date
			},
			...deposit
		}));
	}

}
