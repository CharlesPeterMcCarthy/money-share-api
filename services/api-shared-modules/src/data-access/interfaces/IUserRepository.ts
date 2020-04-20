import { LastEvaluatedKey, UserItem } from '../..';
import { User, UserBrief } from '@moneyshare/common-types';

export interface IUserRepository {
	getAll(lastEvaluatedKey?: LastEvaluatedKey): Promise<{ users: User[]; lastEvaluatedKey: Partial<UserItem> }>;
	getById(userId: string, isOtherUser?: boolean): Promise<User>;
	getUserBrief(userId: string): Promise<UserBrief>;
	update(userId: string, changes: Partial<User>): Promise<User>;
	delete(userId: string): Promise<User | undefined>;
	createAfterSignUp(userId: string, toCreate: Partial<User>): Promise<User>;
	searchByText(currentUserId: string, searchText: string, lastEvaluatedKey?: LastEvaluatedKey): Promise<{ users: User[]; lastEvaluatedKey: Partial<UserItem> }>;
}
