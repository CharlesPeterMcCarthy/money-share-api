import { ApiHandler, UnitOfWork } from '../../api-shared-modules/src';
import { TransferController } from './transfer.controller';

const unitOfWork: UnitOfWork = new UnitOfWork();
const controller: TransferController = new TransferController(unitOfWork);

export const transfer: ApiHandler = controller.transfer;
