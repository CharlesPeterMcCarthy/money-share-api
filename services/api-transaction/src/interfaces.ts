import { LastEvaluatedKey } from '@moneyshare/common-types';

export interface GetAllTransactionsData {
	lastEvaluatedKey?: LastEvaluatedKey;
}
