import { ApiHandler, UnitOfWork } from '../../api-shared-modules/src';
import { WithdrawController } from './withdraw.controller';

const unitOfWork: UnitOfWork = new UnitOfWork();
const controller: WithdrawController = new WithdrawController(unitOfWork);

export const getAllWithdrawals: ApiHandler = controller.getAllWithdrawals;
export const withdraw: ApiHandler = controller.withdraw;
