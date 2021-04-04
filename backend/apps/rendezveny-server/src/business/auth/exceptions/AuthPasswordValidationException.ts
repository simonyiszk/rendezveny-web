import { BusinessException } from '../../utils/BusinessException';

export class AuthPasswordValidationException extends BusinessException {
	public constructor() {
		super('AUTH_PASSWORD_VALIDATION', "User's password must not be empty", {});
	}
}
