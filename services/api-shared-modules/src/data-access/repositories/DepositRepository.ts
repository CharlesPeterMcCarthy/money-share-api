import { Repository } from './Repository';
import { Deposit } from '@moneyshare/common-types';
import { DepositItem } from '../../models/core';
import { v4 as uuid } from 'uuid';

export class DepositRepository extends Repository {

	public async create(userId: string, deposit: Partial<Deposit>): Promise<Deposit> {
		const date: string = new Date().toISOString();
		const depositId: string = uuid();

		return this.db.put(Object.assign(new DepositItem(), {
			depositId,
			pk: `deposit#${depositId}`,
			sk: `user#${userId}`,
			sk2: `createdAt#${date}`,
			entity: 'deposit',
			times: {
				createdAt: date
			},
			...deposit
		}));
	}

}
