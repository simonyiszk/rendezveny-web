import { BusinessException } from '../../utils/BusinessException';

export class EventDoesNotExistsException extends BusinessException {
	public constructor(id: string) {
		super('EVENT_DOES_NOT_EXISTS', `Event with id ${id} does not exists`, { id });
	}
}
