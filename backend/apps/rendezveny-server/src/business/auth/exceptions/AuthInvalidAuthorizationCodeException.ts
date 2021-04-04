import { BusinessException } from '../../utils/BusinessException';

export class AuthInvalidAuthorizationCodeException extends BusinessException {
	public constructor() {
		super('AUTH_INVALID_AUTHORIZATION_CODE', 'Invalid authorization code', {});
	}
}
