import { BusinessException } from '../../utils/BusinessException';

export class EventEndDateValidationException extends BusinessException {
	public constructor() {
		super(
			'EVENT_END_DATE_INVALID',
			'Event end date is invalid',
			{}
		);
	}
}