import { ApiHandler, UnitOfWork } from '../../api-shared-modules/src';
import { UserController } from './user.controller';

const unitOfWork: UnitOfWork = new UnitOfWork();
const controller: UserController = new UserController(unitOfWork);

export const getAllUsers: ApiHandler = controller.getAllUsers;
export const searchUsersByText: ApiHandler = controller.searchUsersByText;
export const getCurrentUser: ApiHandler = controller.getCurrentUser;
export const getUserById: ApiHandler = controller.getUserById;
export const updateUser: ApiHandler = controller.updateUser;
