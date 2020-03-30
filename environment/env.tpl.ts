export const WEBSOCKET_ENDPOINT: string = process.env.IS_OFFLINE ?
	'http://localhost:3001' :
	'{{ LIVE_WEBSOCKET_ENDPOINT }}';

export const USER_POOL_ID: string = '{{ COGNITO_USER_POOL_ID }}';
