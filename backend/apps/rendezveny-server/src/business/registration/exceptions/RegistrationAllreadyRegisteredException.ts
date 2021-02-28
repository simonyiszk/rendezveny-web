import { BusinessException } from '../../utils/BusinessException';

export class RegistrationAllreadyRegisteredException extends BusinessException {
	public constructor() {
		super('REGISTRATION_ALREADY_REGISTERED', 'Cannot register twice for an event', {});
	}
}
