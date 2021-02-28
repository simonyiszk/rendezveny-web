import { BusinessException } from '../../utils/BusinessException';

export class RegistrationNameValidationException extends BusinessException {
	public constructor() {
		super('REGISTRATION_NAME_INVALID', 'Name cannot be empty', {});
	}
}
