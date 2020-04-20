import { UserItem } from '../../models/core';
import { GetOptions, QueryOptions, QueryPaginator } from '@aws/dynamodb-data-mapper';
import { Repository } from './Repository';
import { QueryKey } from '../interfaces';
import { LastEvaluatedKey } from '../../types';
import { User, UserBrief } from '@moneyshare/common-types';
import { ConditionExpression, contains, ContainsPredicate, InequalityExpressionPredicate, notEquals } from '@aws/dynamodb-expressions';

export class UserRepository extends Repository {

	public async getAll(lastEvaluatedKey?: LastEvaluatedKey): Promise<{ users: User[]; lastEvaluatedKey: Partial<UserItem> }> {
		// const predicate: MembershipExpressionPredicate = inList('User', 'Admin');
		//
		// const expression: ConditionExpression = {
		// 	...predicate,
		// 	subject: 'userType'
		// };

		const keyCondition: QueryKey = {
			entity: 'user'
		};
		const queryOptions: QueryOptions = {
			indexName: 'entity-sk2-index',
			scanIndexForward: false,
			startKey: lastEvaluatedKey,
			// filter: expression,
			limit: 10
		};

		const queryPages: QueryPaginator<UserItem> = this.db.query(UserItem, keyCondition, queryOptions).pages();
		const users: User[] = [];
		for await (const page of queryPages) {
			for (const user of page)
				users.push(user);
		}
		return {
			users,
			lastEvaluatedKey:
				queryPages.lastEvaluatedKey ?
					queryPages.lastEvaluatedKey :
					undefined
		};
	}

	public async searchByText(currentUserId: string, searchText: string, lastEvaluatedKey?: LastEvaluatedKey): Promise<{ users: User[]; lastEvaluatedKey: Partial<UserItem> }> {
		const predicate: ContainsPredicate = contains(searchText);
		const nePredicate: InequalityExpressionPredicate = notEquals(currentUserId);

		const expression: ConditionExpression = {
			...predicate,
			subject: 'searchText'
		};
		const neExpression: ConditionExpression = {
			...nePredicate,
			subject: 'userId'
		};

		const andExpression: ConditionExpression = {
			type: 'And',
			conditions: [
				expression,
				neExpression
			]
		};

		const keyCondition: QueryKey = {
			entity: 'user'
		};
		const queryOptions: QueryOptions = {
			indexName: 'entity-sk2-index',
			scanIndexForward: false,
			startKey: lastEvaluatedKey,
			filter: andExpression,
			limit: 10
		};

		const queryPages: QueryPaginator<UserItem> = this.db.query(UserItem, keyCondition, queryOptions).pages();
		const users: User[] = [];
		for await (const page of queryPages) {
			for (const user of page)
				users.push(user);
		}
		return {
			users,
			lastEvaluatedKey:
				queryPages.lastEvaluatedKey ?
					queryPages.lastEvaluatedKey :
					undefined
		};
	}

	public async getById(userId: string, otherUser?: boolean): Promise<User> {
		const options: GetOptions = otherUser ? {
			projection: [ 'userId', 'firstName', 'lastName', 'avatar', 'userType' ]
		} : { };
		return this.db.get(Object.assign(new UserItem(), {
			pk: `user#${userId}`,
			sk: `user#${userId}`
		}), options);
	}

	public async getUserBrief(userId: string): Promise<UserBrief> {
		return this.db.get(Object.assign(new UserItem(), {
			pk: `user#${userId}`,
			sk: `user#${userId}`
		}), { projection: [ 'userId', 'email', 'firstName', 'lastName', 'avatar' ] });
	}

	public async createAfterSignUp(userId: string, toCreate: Partial<User>): Promise<User> {
		const date: string = new Date().toISOString();
		const searchText: string = `${toCreate.email} ${toCreate.firstName} ${toCreate.lastName}`;

		return this.db.put(Object.assign(new UserItem(), {
			userId,
			pk: `user#${userId}`,
			sk: `user#${userId}`,
			sk2: `user#${userId}`,
			entity: 'user',
			confirmed: false,
			accountBalance: 0,
			times: {
				createdAt: date
			},
			connections: [],
			recentRecipients: [],
			searchText,
			...toCreate
		}));
	}

	public async update(userId: string, changes: Partial<User>): Promise<User> {
		delete changes.sk2;
		delete changes.sk3;

		return this.db.update(Object.assign(new UserItem(), {
			pk: `user#${userId}`,
			sk: `user#${userId}`,
			...changes
		}), {
			onMissing: 'skip'
		});
	}

	public async delete(userId: string): Promise<User | undefined> {
		return this.db.delete(Object.assign(new UserItem(), {
			pk: `user#${userId}`,
			sk: `user#${userId}`
		}), {
			returnValues: 'ALL_OLD'
		});
	}
}
