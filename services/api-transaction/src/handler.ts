import { ApiHandler, UnitOfWork } from '../../api-shared-modules/src';
import { TransactionController } from './transaction.controller';

const unitOfWork: UnitOfWork = new UnitOfWork();
const controller: TransactionController = new TransactionController(unitOfWork);

export const getAllTransactions: ApiHandler = controller.getAllTransactions;
export const getTransactionPreview: ApiHandler = controller.getTransactionPreview;
export const getGraphData: ApiHandler = controller.getGraphData;
