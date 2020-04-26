import { Withdrawal } from '@moneyshare/common-types';
import { LastEvaluatedKey } from '../../types';

export interface IWithdrawRepository {
	getAll(userId: string, limit?: number, lastEvaluatedKey?: LastEvaluatedKey): Promise<{ withdrawals: Withdrawal[]; lastEvaluatedKey: Partial<LastEvaluatedKey> }>;
	create(userId: string, deposit: Partial<Withdrawal>): Promise<Withdrawal>;
}
