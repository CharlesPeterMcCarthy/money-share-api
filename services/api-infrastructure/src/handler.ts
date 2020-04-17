import { UnitOfWork, TriggerCognitoHandler } from '../../api-shared-modules/src';
import { AuthController } from './auth.controller';
import { STRIPE_API_KEY } from '../../../environment/env';
import Stripe from 'stripe';

const stripe: Stripe = new Stripe(STRIPE_API_KEY, {
	apiVersion: '2020-03-02'
});

const unitOfWork: UnitOfWork = new UnitOfWork();
const controller: AuthController = new AuthController(unitOfWork, stripe);

export const postSignUp: TriggerCognitoHandler = controller.postSignUp;
export const postConfirmation: TriggerCognitoHandler = controller.postConfirmation;
export const preSignUp: TriggerCognitoHandler = controller.preSignUp;
