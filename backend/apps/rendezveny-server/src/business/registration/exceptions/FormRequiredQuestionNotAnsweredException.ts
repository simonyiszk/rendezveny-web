import { BusinessException } from '../../utils/BusinessException';

export class FormRequiredQuestionNotAnsweredException extends BusinessException {
	public constructor() {
		super(
			'FORM_REQUIRED_QUESTION_NOT_ANSWERED',
			'Required question was not answered.',
			{}
		);
	}
}