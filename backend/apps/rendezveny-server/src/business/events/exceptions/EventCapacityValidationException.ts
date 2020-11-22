import { BusinessException } from '../../utils/BusinessException';

export class EventCapacityValidationException extends BusinessException {
	public constructor() {
		super(
			'EVENT_CAPACITY_INVALID',
			'Event capacity is invalid',
			{}
		);
	}
}