import { BusinessException } from '../../utils/BusinessException';

export class RegistrationDoesNotExistsException extends BusinessException {
	public constructor(id: string) {
		super(
			'REGISTRATION_DOES_NOT_EXISTS',
			`Registration with id ${id} does not exists`,
			{ id }
		);
	}
}