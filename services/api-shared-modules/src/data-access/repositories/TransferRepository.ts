import { Repository } from './Repository';
import { Transfer } from '@moneyshare/common-types';
import { TransferItem } from '../../models/core';
import { v4 as uuid } from 'uuid';

export class TransferRepository extends Repository {

	public async create(userId: string, transfer: Partial<Transfer>): Promise<Transfer> {
		const date: string = new Date().toISOString();
		const transferId: string = uuid();

		return this.db.put(Object.assign(new TransferItem(), {
			transferId,
			pk: `transfer#${transferId}`,
			sk: `user#${userId}/createdAt#${date}`,
			sk2: `createdAt#${date}`,
			entity: 'transfer',
			times: {
				createdAt: date
			},
			...transfer
		}));
	}

}
