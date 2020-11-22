import { BusinessException } from '../../utils/BusinessException';

export class EventUniqueNameValidationException extends BusinessException {
	public constructor() {
		super(
			'EVENT_UNIQUE_NAME_INVALID',
			'Event unique name is invalid',
			{}
		);
	}
}