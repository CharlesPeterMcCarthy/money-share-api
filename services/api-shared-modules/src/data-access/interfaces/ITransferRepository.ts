import { Transfer } from '@moneyshare/common-types';

export interface ITransferRepository {
	create(userId: string, transfer: Partial<Transfer>): Promise<Transfer>;
}
