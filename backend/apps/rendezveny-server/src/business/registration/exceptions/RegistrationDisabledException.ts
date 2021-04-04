import { BusinessException } from '../../utils/BusinessException';

export class RegistrationDisabledException extends BusinessException {
	public constructor() {
		super('REGISTRATION_DISABLED', 'Registration is disabled', {});
	}
}
