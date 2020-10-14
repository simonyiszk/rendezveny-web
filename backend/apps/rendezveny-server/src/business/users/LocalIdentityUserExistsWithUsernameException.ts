import { BusinessException } from '../utils/BusinessException';

export class LocalIdentityUserExistsWithUsernameException extends BusinessException {
	public constructor(username: string) {
		super(
			'LOCAL_IDENTITY_WITH_USERNAME_EXISTS',
			`User with username ${username} already exists`,
			{ username }
		);
	}
}