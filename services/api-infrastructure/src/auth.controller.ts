import {
	UnitOfWork,
	TriggerCognitoEvent,
	TriggerCognitoHandler
} from '../../api-shared-modules/src';
import { User } from '@moneyshare/common-types';
import Stripe from 'stripe';

export class AuthController {

	public constructor(
		private unitOfWork: UnitOfWork,
		private stripe: Stripe
	) { }

	public preSignUp: TriggerCognitoHandler = async (event: TriggerCognitoEvent) => {
		// Perform any pre-sign-up checks
		try {
			return event;
		} catch (err) {
			return err;
		}
	}

	public postSignUp: TriggerCognitoHandler = async (event: TriggerCognitoEvent) => {
		const cognitoUser: { [key: string]: string } = event.request.userAttributes;

		const user: Partial<User> = {
			email : cognitoUser.email,
			confirmed: false,
			accountBalance: 0
		};

		event.response.emailSubject = 'Welcome to MoneyShare';
		event.response.emailMessage =
			`Hi ${cognitoUser.given_name},
			Welcome to MoneyShare!<br><br>
			Thanks for signing up.<br><br>
			Use this link to confirm your account:
			<a href="http://localhost:4200/confirm/${cognitoUser.email}/${event.request.codeParameter}">Confirm</a><br>
			- MoneyShare`;

		try {
			user.userType = 'User';
			user.firstName = cognitoUser.given_name;
			user.lastName = cognitoUser.family_name;

			const customer: Stripe.Customer = await this.stripe.customers.create({
				name: `${user.firstName} ${user.lastName}`
			});

			user.stripeCustomerId = customer.id;

			await this.unitOfWork.Users.createAfterSignUp(cognitoUser.sub, { ...user });

			return event;
		} catch (err) {
			console.log(err);
			return err;
		}
	}

	public postConfirmation: TriggerCognitoHandler = async (event: TriggerCognitoEvent) => {
		const cognitoUser: { [key: string]: string } = event.request.userAttributes;

		const user: User = await this.unitOfWork.Users.getById(cognitoUser.sub);
		user.confirmed = true;
		user.times.confirmedAt = new Date().toISOString();

		try {
			await this.unitOfWork.Users.update(cognitoUser.sub, { ...user });

			return event;
		} catch (err) {
			return err;
		}
	}
}
