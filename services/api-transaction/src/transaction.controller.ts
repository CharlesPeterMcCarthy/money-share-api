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
import { GraphPoint, Transaction, User } from '@moneyshare/common-types';
import { GetAllTransactionsData } from './interfaces';

export class TransactionController {

	public constructor(
		private unitOfWork: UnitOfWork
	) { }

	public getAllTransactions: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<ApiResponse> => {
		let lastEvaluatedKey: LastEvaluatedKey;
		const data: GetAllTransactionsData = JSON.parse(event.body);

		if (data && data.lastEvaluatedKey) {
			const { pk, sk, sk2, entity }: LastEvaluatedKey = data.lastEvaluatedKey;
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

			const result: { transactions: Transaction[]; lastEvaluatedKey: Partial<TransactionItem> } = await this.unitOfWork.Transactions.getAll(userId, 10, lastEvaluatedKey);
			if (!result) return ResponseBuilder.notFound(ErrorCode.GeneralError, 'Failed to retrieve Transactions');

			return ResponseBuilder.ok({ ...result, count: result.transactions.length });
		} catch (err) {
			return ResponseBuilder.internalServerError(err, err.message);
		}

	}

	public getTransactionPreview: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<ApiResponse> => {
		try {
			const userId: string = SharedFunctions.getUserIdFromAuthProvider(event);
			const user: User = await this.unitOfWork.Users.getById(userId);
			if (!user) return ResponseBuilder.notFound(ErrorCode.InvalidId, 'User Not Found');

			const transactions: Transaction[] = await this.unitOfWork.Transactions.getLast(user.userId, 5);
			if (!transactions) return ResponseBuilder.notFound(ErrorCode.GeneralError, 'Failed to retrieve Transactions');

			return ResponseBuilder.ok({ transactions });
		} catch (err) {
			return ResponseBuilder.internalServerError(err, err.message);
		}
	}

	public getGraphData: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<ApiResponse> => {
		try {
			const userId: string = SharedFunctions.getUserIdFromAuthProvider(event);
			const user: User = await this.unitOfWork.Users.getById(userId);
			if (!user) return ResponseBuilder.notFound(ErrorCode.InvalidId, 'User Not Found');

			const result: { transactions: Transaction[]; lastEvaluatedKey: Partial<TransactionItem> } = await this.unitOfWork.Transactions.getAll(userId);
			if (!result) return ResponseBuilder.notFound(ErrorCode.GeneralError, 'Failed to retrieve Graph Data');

			const transactions: Transaction[] = result.transactions;

			const data: GraphPoint[] = transactions.map((t: Transaction) => ({
				y: t.newBalance / 100
				// indexLabel: `€${(t.newBalance / 100).toFixed(2)}`
			}));

			return ResponseBuilder.ok({ data });
		} catch (err) {
			return ResponseBuilder.internalServerError(err, err.message);
		}
	}

}
