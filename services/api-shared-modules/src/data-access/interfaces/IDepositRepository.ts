import { Deposit } from '@moneyshare/common-types';
import { LastEvaluatedKey } from '../../types';
import { DepositItem } from '../../models/core';

export interface IDepositRepository {
	getAll(userId: string, limit?: number, lastEvaluatedKey?: LastEvaluatedKey): Promise<{ deposits: Deposit[]; lastEvaluatedKey: Partial<DepositItem> }>;
	create(userId: string, deposit: Partial<Deposit>): Promise<Deposit>;
}
