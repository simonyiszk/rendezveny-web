import { BusinessException } from '../../utils/BusinessException';

export class EventRegistrationEndDateValidationException extends BusinessException {
	public constructor() {
		super(
			'EVENT_REGISTRATION_END_DATE_INVALID',
			'Event registration end date is invalid',
			{}
		);
	}
}