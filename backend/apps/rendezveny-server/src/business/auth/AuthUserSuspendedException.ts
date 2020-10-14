import { BusinessException } from '../utils/BusinessException';

export class AuthUserSuspendedException extends BusinessException {
	public constructor() {
		super(
			'AUTH_USER_SUSPENDED',
			'User is suspended',
			{ }
		);
	}
}