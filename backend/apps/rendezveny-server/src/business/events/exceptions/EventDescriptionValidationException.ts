import { BusinessException } from '../../utils/BusinessException';

export class EventDescriptionValidationException extends BusinessException {
	public constructor() {
		super(
			'EVENT_DESCRIPTION_INVALID',
			'Event description is invalid',
			{}
		);
	}
}