import { BusinessException } from '../../utils/BusinessException';

export class AuthUserNameValidationException extends BusinessException {
	public constructor() {
		super(
			'AUTH_USERNAME_VALIDATION',
			'User\'s username must not be empty',
			{ }
		);
	}
}