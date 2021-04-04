import { BusinessException } from '../../utils/BusinessException';

export class RegistrationOutsideRegistrationPeriodException extends BusinessException {
	public constructor() {
		super('REGISTRATION_OUTSIDE_REGISTRATION_PERIOD', 'Cannot register outside the registration period', {});
	}
}
