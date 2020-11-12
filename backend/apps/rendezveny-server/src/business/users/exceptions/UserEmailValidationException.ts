import { BusinessException } from '../../utils/BusinessException';

export class UserEmailValidationException extends BusinessException {
	public constructor() {
		super(
			'USER_EMAIL_VALIDATION',
			'User\'s email is invalid',
			{ }
		);
	}
}