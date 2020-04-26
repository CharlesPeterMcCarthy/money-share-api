import { Repository } from './Repository';
import { Withdrawal } from '@moneyshare/common-types';
import { WithdrawItem } from '../../models/core';
import { v4 as uuid } from 'uuid';
import { LastEvaluatedKey } from '../../types';
import { QueryKey } from '../interfaces';
import { beginsWith } from '@aws/dynamodb-expressions';
import { QueryOptions, QueryPaginator } from '@aws/dynamodb-data-mapper';

export class WithdrawRepository extends Repository {

	public async getAll(userId: string, limit?: number, lastEvaluatedKey?: LastEvaluatedKey): Promise<{ withdrawals: Withdrawal[]; lastEvaluatedKey: Partial<LastEvaluatedKey> }> {
		const keyCondition: QueryKey = {
			entity: 'withdraw',
			sk: beginsWith(`user#${userId}`)
		};
		const queryOptions: QueryOptions = {
			indexName: 'entity-sk-index',
			scanIndexForward: false,
			startKey: lastEvaluatedKey
		};

		if (limit) queryOptions.limit = limit;

		const queryPages: QueryPaginator<WithdrawItem> = this.db.query(WithdrawItem, keyCondition, queryOptions).pages();
		const withdrawals: Withdrawal[] = [];
		for await (const page of queryPages) {
			for (const withdraw of page)
				withdrawals.push(withdraw);
		}
		return {
			withdrawals,
			lastEvaluatedKey:
				queryPages.lastEvaluatedKey ?
					queryPages.lastEvaluatedKey :
					undefined
		};
	}

	public async create(userId: string, withdraw: Partial<Withdrawal>): Promise<Withdrawal> {
		const date: string = new Date().toISOString();
		const withdrawalId: string = uuid();

		return this.db.put(Object.assign(new WithdrawItem(), {
			withdrawalId,
			pk: `withdraw#${withdrawalId}`,
			sk: `user#${userId}/createdAt#${date}`,
			sk2: `createdAt#${date}`,
			entity: 'withdraw',
			times: {
				createdAt: date
			},
			...withdraw
		}));
	}

}
