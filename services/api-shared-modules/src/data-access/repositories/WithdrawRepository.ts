import { Repository } from './Repository';
import { Withdrawal } from '@moneyshare/common-types';
import { WithdrawItem } from '../../models/core';
import { v4 as uuid } from 'uuid';

export class WithdrawRepository extends Repository {

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
