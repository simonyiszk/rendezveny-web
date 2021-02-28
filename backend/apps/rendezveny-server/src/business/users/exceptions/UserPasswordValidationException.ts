import { BusinessException } from '../../utils/BusinessException';

export class UserPasswordValidationException extends BusinessException {
	public constructor(policy: unknown) {
		super('USER_PASSWORD_VALIDATION', 'The password does not match the policy', policy);
	}
}
