import { BusinessException } from '../../utils/BusinessException';

export class EventChiefOrganizersValidationException extends BusinessException {
	public constructor() {
		super(
			'EVENT_CHIEF_ORGANIZER_IDS_INVALID',
			'There must be at least one organizer in charge of the event',
			{}
		);
	}
}