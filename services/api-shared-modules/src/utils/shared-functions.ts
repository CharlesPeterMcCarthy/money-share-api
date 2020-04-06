import { ApiEvent } from '../types';

export class SharedFunctions {

	public static getUserIdFromAuthProvider = (event: ApiEvent): string => {
		if (
			!event ||
			!event.requestContext ||
			!event.requestContext.identity ||
			!event.requestContext.identity.cognitoAuthenticationProvider
		) throw Error('Unauthorised action');

		const provider: string = event.requestContext.identity.cognitoAuthenticationProvider;
		if (!process.env.IS_OFFLINE && !provider) throw Error('No Auth Provider');

		const parts: string[] = provider.split(':');
		const userId: string = parts[parts.length - 1];

		if (!userId) throw Error('Unauthorised action');
		return userId;
	}

	public static checkUserRole = (roles: string[], userRole: string): void => {
		if (!roles.some((role: string) => role === userRole)) throw Error('Unauthorised User');
	}

}
