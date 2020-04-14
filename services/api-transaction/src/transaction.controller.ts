import {
	ResponseBuilder,
	ErrorCode,
	ApiResponse,
	ApiHandler,
	ApiEvent,
	ApiContext,
	UnitOfWork,
	LastEvaluatedKey,
	TransactionItem, SharedFunctions
} from '../../api-shared-modules/src';
import { Transaction, User } from '@moneyshare/common-types';

export class TransactionController {

	public constructor(
		private unitOfWork: UnitOfWork
	) { }

	public getAllTransactions: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<ApiResponse> => {
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
			const userId: string = SharedFunctions.getUserIdFromAuthProvider(event);
			const user: User = await this.unitOfWork.Users.getById(userId);
			if (!user) return ResponseBuilder.notFound(ErrorCode.InvalidId, 'User Not Found');

			const result: { transactions: Transaction[]; lastEvaluatedKey: Partial<TransactionItem> } = await this.unitOfWork.Transactions.getAll(userId, lastEvaluatedKey);
			if (!result) return ResponseBuilder.notFound(ErrorCode.GeneralError, 'Failed to retrieve Transactions');

			return ResponseBuilder.ok({ ...result, count: result.transactions.length });
		} catch (err) {
			return ResponseBuilder.internalServerError(err, err.message);
		}

	}

}
