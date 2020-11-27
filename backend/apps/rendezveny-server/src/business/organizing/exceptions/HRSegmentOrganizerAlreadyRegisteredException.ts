import { BusinessException } from '../../utils/BusinessException';

export class HRSegmentOrganizerAlreadyRegisteredException extends BusinessException {
	public constructor() {
		super(
			'HRSEGMENT_ORGANIZER_ALREADY_REGISTERED',
			'The organizer is already registered to the HR segment',
			{}
		);
	}
}