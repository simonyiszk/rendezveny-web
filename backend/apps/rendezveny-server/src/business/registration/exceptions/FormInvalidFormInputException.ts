import { BusinessException } from '../../utils/BusinessException';

export class FormInvalidFormInputException extends BusinessException {
	public constructor() {
		super('FORM_INVALID_FORM_INPUT', 'Invalid form input.', {});
	}
}
