import { BusinessException } from '../../utils/BusinessException';

export class EventStartDateValidationException extends BusinessException {
	public constructor() {
		super(
			'EVENT_START_DATE_INVALID',
			'Event start date is invalid',
			{}
		);
	}
}