import { BusinessException } from '../../utils/BusinessException';

export class OrganizerIsNotAnOrganizerException extends BusinessException {
	public constructor() {
		super('ORGANIZER_IS_NOT_AN_ORGANIZER', 'The user is not an organizer of the event', {});
	}
}
