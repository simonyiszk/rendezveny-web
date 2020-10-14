import { BusinessException } from '../utils/BusinessException';

export class UserDoesNotExistsException extends BusinessException {
	public constructor(id: string) {
		super(
			'USER_DOES_NOT_EXISTS',
			`User with id ${id} does not exists`,
			{ id }
		);
	}
}