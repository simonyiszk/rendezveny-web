import { BusinessException } from '../../utils/BusinessException';

export class EventRegistrationDateIntervalValidationException extends BusinessException {
	public constructor() {
		super(
			'EVENT_REGISTRATION_DATE_INTERVAL_INVALID',
			'Event registration date interval is invalid',
			{}
		);
	}
}