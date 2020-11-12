import { BusinessException } from '../../utils/BusinessException';

export class RegistrationEmailValidationException extends BusinessException {
	public constructor() {
		super(
			'REGISTRATION_EMAIL_INVALID',
			'The email must be a valid email address',
			{}
		);
	}
}