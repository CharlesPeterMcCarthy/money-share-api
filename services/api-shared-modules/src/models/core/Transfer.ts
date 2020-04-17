import { DynamoDbItem } from '../DynamoDBItem';
import { attribute } from '@aws/dynamodb-data-mapper-annotations';
import { Transfer } from '@moneyshare/common-types';

export class TransferItem extends DynamoDbItem implements Transfer {

	@attribute()
	public transferId!: string;

	@attribute()
	public amount!: number;

	@attribute()
	public recipientUserId!: string;

	@attribute()
	public message!: string;

	@attribute()
	public times: {
		createdAt: string;
	};

}
