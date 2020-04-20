import {
	ResponseBuilder,
	ErrorCode,
	ApiResponse,
	ApiHandler,
	ApiEvent,
	ApiContext,
	UnitOfWork,
	SharedFunctions,
	UserItem,
	LastEvaluatedKey
} from '../../api-shared-modules/src';
import { User } from '@moneyshare/common-types';

export class UserController {

	public constructor(private unitOfWork: UnitOfWork) { }

	public getAllUsers: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<ApiResponse> => {
		let lastEvaluatedKey: LastEvaluatedKey;
		if (event.body) {
			const { pk, sk, sk2, entity}: LastEvaluatedKey = JSON.parse(event.body) as LastEvaluatedKey;
			lastEvaluatedKey = {
				pk,
				sk,
				sk2,
				entity
			};
		}
		try {
			const currentUserId: string = SharedFunctions.getUserIdFromAuthProvider(event);
			const currentUser: User = await this.unitOfWork.Users.getById(currentUserId);
			if (!currentUser) return ResponseBuilder.notFound(ErrorCode.InvalidId, 'Unauthenticated User');

			const result: { users: User[]; lastEvaluatedKey: Partial<UserItem> } = await this.unitOfWork.Users.getAll(lastEvaluatedKey);
			if (!result) return ResponseBuilder.notFound(ErrorCode.GeneralError, 'Failed to retrieve Users');

			return ResponseBuilder.ok({ ...result, count: result.users.length });
		} catch (err) {
			return ResponseBuilder.internalServerError(err, err.message);
		}
	}

	public getCurrentUser: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<ApiResponse> => {
		try {
			const currentUserId: string = SharedFunctions.getUserIdFromAuthProvider(event);
			const currentUser: User = await this.unitOfWork.Users.getById(currentUserId, false);
			if (!currentUser) return ResponseBuilder.notFound(ErrorCode.InvalidId, 'Unauthenticated User');

			return ResponseBuilder.ok({ user: currentUser });
		} catch (err) {
			return ResponseBuilder.internalServerError(err, err.message);
		}
	}

	public getUserById: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<ApiResponse> => {
		if (!event.pathParameters || !event.pathParameters.userId) return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Invalid request parameters');
		const userId: string = event.pathParameters.userId;

		try {
			const currentUserId: string = SharedFunctions.getUserIdFromAuthProvider(event);
			const currentUser: User = await this.unitOfWork.Users.getById(currentUserId);
			if (!currentUser) return ResponseBuilder.notFound(ErrorCode.InvalidId, 'Unauthenticated User');

			const user: User = await this.unitOfWork.Users.getById(userId, userId !== currentUser.userId);
			if (!user) return ResponseBuilder.notFound(ErrorCode.InvalidId, 'User Not Found');

			return ResponseBuilder.ok({ user });
		} catch (err) {
			return ResponseBuilder.internalServerError(err, err.message);
		}
	}

	public updateUser: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<ApiResponse> => {
		if (!event.body) return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Invalid request body');

		const data: any = JSON.parse(event.body);
		const user: Partial<User> = data.user;

		try {
			const currentUserId: string = SharedFunctions.getUserIdFromAuthProvider(event);
			const currentUser: User = await this.unitOfWork.Users.getById(currentUserId);
			if (!currentUser) return ResponseBuilder.notFound(ErrorCode.InvalidId, 'Unauthenticated User');

			const result: User = await this.unitOfWork.Users.update(currentUserId, { ...user });
			if (!result) return ResponseBuilder.notFound(ErrorCode.InvalidId, 'User Not Found');

			return ResponseBuilder.ok({ user: result });
		} catch (err) {
			return ResponseBuilder.internalServerError(err, err.message);
		}
	}

	public searchUsersByText: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<ApiResponse> => {
		if (!event.pathParameters || !event.pathParameters.searchText)
			return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Invalid request parameters');

		const searchText: string = event.pathParameters.searchText;

		try {
			const userId: string = SharedFunctions.getUserIdFromAuthProvider(event);
			const user: User = await this.unitOfWork.Users.getById(userId);
			if (!user) return ResponseBuilder.notFound(ErrorCode.InvalidId, 'User not found');

			const result: { users: User[]; lastEvaluatedKey: Partial<UserItem> } = await this.unitOfWork.Users.searchByText(userId, searchText);

			return ResponseBuilder.ok({ ...result });
		} catch (err) {
			console.log(err);
			return ResponseBuilder.internalServerError(err, err.message);
		}
	}

}
