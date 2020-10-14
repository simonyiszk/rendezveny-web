import { BusinessException } from '../utils/BusinessException';

export class UserUserNameValidationException extends BusinessException {
	public constructor() {
		super(
			'USER_USERNAME_VALIDATION',
			'User\'s username must not be empty',
			{ }
		);
	}
}