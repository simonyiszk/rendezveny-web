import { BusinessException } from '../../utils/BusinessException';

export class UserNameValidationException extends BusinessException {
	public constructor() {
		super(
			'USER_NAME_VALIDATION',
			'User\'s name must not be empty',
			{ }
		);
	}
}