import { DynamoDbItem } from '../DynamoDBItem';
import { attribute } from '@aws/dynamodb-data-mapper-annotations';
import { Withdrawal } from '@moneyshare/common-types';

export class WithdrawItem extends DynamoDbItem implements Withdrawal {

	@attribute()
	public withdrawalId!: string;

	@attribute()
	public amount!: number;

	@attribute()
	public times: {
		createdAt: string;
	};

}
