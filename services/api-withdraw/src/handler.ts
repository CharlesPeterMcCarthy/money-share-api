import { ApiHandler, UnitOfWork } from '../../api-shared-modules/src';
import { WithdrawController } from './withdraw.controller';

const unitOfWork: UnitOfWork = new UnitOfWork();
const controller: WithdrawController = new WithdrawController(unitOfWork);

export const withdraw: ApiHandler = controller.withdraw;
