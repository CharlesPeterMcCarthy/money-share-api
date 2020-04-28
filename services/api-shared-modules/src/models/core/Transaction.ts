import { DynamoDbItem } from '../DynamoDBItem';
import { attribute } from '@aws/dynamodb-data-mapper-annotations';
import { Transaction, TransactionType } from '@moneyshare/common-types';

export class TransactionItem extends DynamoDbItem implements Transaction {

	@attribute()
	public transactionId!: string;

	@attribute()
	public type!: TransactionType;

	@attribute()
	public text!: string;

	@attribute()
	public amount!: number;

	@attribute()
	public newBalance!: number;

	@attribute()
	public message?: string;

	@attribute()
	public accessKey: {
		pk: string;
		sk: string;
	};

	@attribute()
	public times: {
		createdAt: string;
	};

}
