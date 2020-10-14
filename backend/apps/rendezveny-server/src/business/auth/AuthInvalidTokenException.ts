import { BusinessException } from '../utils/BusinessException';

export class AuthInvalidTokenException extends BusinessException {
	public constructor() {
		super(
			'AUTH_INVALID_TOKEN',
			'Invalid token',
			{ }
		);
	}
}