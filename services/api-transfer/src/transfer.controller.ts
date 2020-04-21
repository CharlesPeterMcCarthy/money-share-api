import {
	ResponseBuilder,
	ErrorCode,
	ApiResponse,
	ApiHandler,
	ApiEvent,
	ApiContext,
	UnitOfWork,
	SharedFunctions
} from '../../api-shared-modules/src';
import { Transaction, Transfer, User, UserBrief } from '@moneyshare/common-types';
import { CreateTransferData } from './interfaces';

export class TransferController {

	public constructor(
		private unitOfWork: UnitOfWork
	) { }

	public transfer: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<ApiResponse> => {
		if (!event.body) return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Invalid request body');
		const data: CreateTransferData = JSON.parse(event.body);

		if (!data.transfer) return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Invalid request parameters');
		const transfer: Partial<Transfer> = data.transfer;

		if (!transfer.recipientUserId) return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Recipient is Missing');
		if (!transfer.amount) return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Deposit Amount is Missing');
		if (transfer.amount < 100) return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Minimum 1 Euro Transfer');

		try {
			const userId: string = SharedFunctions.getUserIdFromAuthProvider(event);
			const user: User = await this.unitOfWork.Users.getById(userId);
			if (!user) return ResponseBuilder.notFound(ErrorCode.InvalidId, 'User not found');

			if (transfer.amount > user.accountBalance) return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Insufficient Funds');

			const recipientBrief: UserBrief = await this.unitOfWork.Users.getUserBrief(transfer.recipientUserId);
			const previousRecipient: number = user.recentRecipients.findIndex(((r: UserBrief): boolean => r.userId === transfer.recipientUserId));
			if (previousRecipient > -1) user.recentRecipients.splice(previousRecipient, 1);

			user.recentRecipients.unshift(recipientBrief);
			user.accountBalance = (user.accountBalance || 0) - transfer.amount;

			await this.unitOfWork.Users.update(user.userId, user);

			const recipient: User = await this.unitOfWork.Users.getById(transfer.recipientUserId);
			recipient.accountBalance = (recipient.accountBalance || 0) + transfer.amount;
			await this.unitOfWork.Users.update(user.userId, recipient);

			const completeTransfer: Transfer = await this.unitOfWork.Transfers.create(userId, transfer);

			const senderTransaction: Partial<Transaction> = {
				type: 'TRANSFER',
				amount: completeTransfer.amount,
				newBalance: user.accountBalance,
				text: `You sent €${(completeTransfer.amount / 100).toFixed(2)} to ${recipient.firstName} ${recipient.lastName}`,
				message: completeTransfer.message,
				accessKey: {
					pk: completeTransfer.pk,
					sk: completeTransfer.sk
				}
			};

			await this.unitOfWork.Transactions.create(user.userId, senderTransaction);

			const recipientTransaction: Partial<Transaction> = {
				type: 'RECEIVE',
				amount: completeTransfer.amount,
				newBalance: recipient.accountBalance,
				text: `You received €${(completeTransfer.amount / 100).toFixed(2)} from ${user.firstName} ${user.lastName}`,
				message: completeTransfer.message,
				accessKey: {
					pk: completeTransfer.pk,
					sk: completeTransfer.sk
				}
			};

			await this.unitOfWork.Transactions.create(recipient.userId, recipientTransaction);

			return ResponseBuilder.ok({ });
		} catch (err) {
			console.log(err);
			return ResponseBuilder.internalServerError(err, err.message);
		}
	}

}
