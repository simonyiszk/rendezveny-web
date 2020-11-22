import { BusinessException } from '../../utils/BusinessException';

export class RegistrationLimitReachedException extends BusinessException {
	public constructor() {
		super(
			'REGISTRATION_LIMIT_REACHED',
			'Registration limit is reached',
			{}
		);
	}
}