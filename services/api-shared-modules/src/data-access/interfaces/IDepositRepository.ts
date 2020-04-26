import { Deposit } from '@moneyshare/common-types';
import { LastEvaluatedKey } from '../../types';

export interface IDepositRepository {
	getAll(userId: string, limit?: number, lastEvaluatedKey?: LastEvaluatedKey): Promise<{ deposits: Deposit[]; lastEvaluatedKey: Partial<LastEvaluatedKey> }>;
	create(userId: string, deposit: Partial<Deposit>): Promise<Deposit>;
}
