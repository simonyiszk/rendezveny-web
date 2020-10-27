import { BusinessException } from '../../utils/BusinessException';

export class EventHostingClubsValidationException extends BusinessException {
	public constructor() {
		super(
			'EVENT_HOSTING_CLUB_IDS_INVALID',
			'There must be at least one club hosting the event',
			{}
		);
	}
}