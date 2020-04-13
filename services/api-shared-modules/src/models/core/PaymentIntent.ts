import { DynamoDbItem } from '../DynamoDBItem';
import { attribute } from '@aws/dynamodb-data-mapper-annotations';
import { PaymentIntent } from '@moneyshare/common-types';

export class PaymentIntentItem extends DynamoDbItem implements PaymentIntent {

	@attribute()
	public id!: string;

	@attribute()
	public clientSecret!: string;

	@attribute()
	public amount!: number;

	@attribute()
	public transactionComplete!: boolean;

	@attribute()
	public times: {
		createdAt: string;
		completeAt?: string;
	};

}
