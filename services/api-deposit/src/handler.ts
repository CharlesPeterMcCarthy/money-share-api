import { ApiHandler, UnitOfWork } from '../../api-shared-modules/src';
import { DepositController } from './deposit.controller';
import Stripe from 'stripe';
import { STRIPE_API_KEY } from '../../../environment/env';

const stripe: Stripe = new Stripe(STRIPE_API_KEY, {
	apiVersion: '2020-03-02'
});

const unitOfWork: UnitOfWork = new UnitOfWork();
const controller: DepositController = new DepositController(unitOfWork, stripe);

export const depositBegin: ApiHandler = controller.depositBegin;
export const depositComplete: ApiHandler = controller.depositComplete;
