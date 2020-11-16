import { BusinessException } from '../../utils/BusinessException';

export class OrganizerAlreadyIsAnOrganizerException extends BusinessException {
	public constructor() {
		super(
			'ORGANIZER_IS_ALREADY_AN_ORGANIZER',
			'The user is already an organizer of the event',
			{}
		);
	}
}