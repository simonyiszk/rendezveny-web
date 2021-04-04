import { BusinessException } from '../../utils/BusinessException';

export class EventDateIntervalValidationException extends BusinessException {
	public constructor() {
		super('EVENT_DATE_INTERVAL_INVALID', 'Event date interval is invalid', {});
	}
}
