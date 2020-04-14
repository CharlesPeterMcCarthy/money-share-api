import { Repository } from './Repository';
import { Transaction } from '@moneyshare/common-types';
import { TransactionItem } from '../../models/core';
import { v4 as uuid } from 'uuid';

export class TransactionRepository extends Repository {

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
