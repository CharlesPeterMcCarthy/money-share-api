import { Deposit } from '@moneyshare/common-types';

export interface IDepositRepository {
	create(userId: string, deposit: Partial<Deposit>): Promise<Deposit>;
}
