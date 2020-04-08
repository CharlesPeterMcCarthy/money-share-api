import { ApiHandler, UnitOfWork } from '../../api-shared-modules/src';
import { StripeController } from './stripe.controller';
import Stripe from 'stripe';
import { STRIPE_API_KEY } from '../../../environment/env';

const stripe: Stripe = new Stripe(STRIPE_API_KEY, {
	apiVersion: '2020-03-02'
});

const unitOfWork: UnitOfWork = new UnitOfWork();
const controller: StripeController = new StripeController(unitOfWork, stripe);

export const createPaymentIntent: ApiHandler = controller.createPaymentIntent;
