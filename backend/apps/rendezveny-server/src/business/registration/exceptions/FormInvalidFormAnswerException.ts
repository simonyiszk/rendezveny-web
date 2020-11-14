import { BusinessException } from '../../utils/BusinessException';

export class FormInvalidFormAnswerException extends BusinessException {
	public constructor() {
		super(
			'FORM_INVALID_FORM_ANSWER',
			'Invalid form answer.',
			{}
		);
	}
}