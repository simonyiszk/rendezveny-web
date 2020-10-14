import { BusinessException } from '../utils/BusinessException';

export class LocalIdentityUserExistsWithEmailException extends BusinessException {
	public constructor(email: string) {
		super(
			'LOCAL_IDENTITY_WITH_EMAIL_EXISTS',
			`User with email ${email} already exists`,
			{ email }
		);
	}
}