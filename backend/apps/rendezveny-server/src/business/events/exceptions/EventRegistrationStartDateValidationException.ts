import { BusinessException } from '../../utils/BusinessException';

export class EventRegistrationStartDateValidationException extends BusinessException {
	public constructor() {
		super('EVENT_REGISTRATION_START_DATE_INVALID', 'Event registration start date is invalid', {});
	}
}
