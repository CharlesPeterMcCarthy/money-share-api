import { LastEvaluatedKey, UserItem } from '../..';
import { User } from '@moneyshare/common-types';

export interface IUserRepository {
	getAll(lastEvaluatedKey?: LastEvaluatedKey): Promise<{ users: User[]; lastEvaluatedKey: Partial<UserItem> }>;
	getById(userId: string): Promise<User>;
	update(userId: string, changes: Partial<User>): Promise<User>;
	delete(userId: string): Promise<User | undefined>;
	createAfterSignUp(userId: string, toCreate: Partial<User>): Promise<User>;
}
