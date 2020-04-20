import { DynamoDbItem } from '../DynamoDBItem';
import { attribute } from '@aws/dynamodb-data-mapper-annotations';
import { User, UserBrief, UserConnection, UserType } from '@moneyshare/common-types';

export class UserItem extends DynamoDbItem implements User {

	@attribute()
	public userId!: string;

	@attribute()
	public email!: string;

	@attribute()
	public firstName!: string;

	@attribute()
	public lastName!: string;

	@attribute()
	public userType!: UserType;

	@attribute()
	public avatar?: string;

	@attribute()
	public confirmed!: boolean;

	@attribute()
	public times: {
		confirmedAt?: string;
		createdAt: string;
		lastLogin?: string;
	};

	@attribute()
	public connections: UserConnection[];

	@attribute()
	public accountBalance: number;

	@attribute()
	public stripeCustomerId: string;

	@attribute()
	public searchText: string;

	@attribute()
	public recentRecipients: UserBrief[];

}
