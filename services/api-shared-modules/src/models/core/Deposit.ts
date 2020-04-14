import { DynamoDbItem } from '../DynamoDBItem';
import { attribute } from '@aws/dynamodb-data-mapper-annotations';
import { Deposit } from '@moneyshare/common-types';

export class DepositItem extends DynamoDbItem implements Deposit {

	@attribute()
	public depositId!: string;

	@attribute()
	public amount!: number;

	@attribute()
	public times: {
		createdAt: string;
	};

}
