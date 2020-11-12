import { BusinessException } from '../../utils/BusinessException';

export class EventNameValidationException extends BusinessException {
	public constructor() {
		super(
			'EVENT_NAME_INVALID',
			'Event name is invalid',
			{}
		);
	}
}