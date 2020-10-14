import { BusinessException } from '../utils/BusinessException';

export class AuthInvalidUsernameOrPasswordException extends BusinessException {
	public constructor() {
		super(
			'AUTH_INVALID_USERNAME_OR_PASSWORD',
			'Invalid username or password',
			{ }
		);
	}
}