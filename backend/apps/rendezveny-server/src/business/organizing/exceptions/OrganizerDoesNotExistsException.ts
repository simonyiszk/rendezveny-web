import { BusinessException } from '../../utils/BusinessException';

export class OrganizerDoesNotExistsException extends BusinessException {
	public constructor(id: string) {
		super('ORGANIZER_DOES_NOT_EXISTS', `Organizer with id ${id} does not exists`, { id });
	}
}
