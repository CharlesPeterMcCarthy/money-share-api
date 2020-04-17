import { Withdrawal } from '@moneyshare/common-types';

export interface IWithdrawRepository {
	create(userId: string, deposit: Partial<Withdrawal>): Promise<Withdrawal>;
}
