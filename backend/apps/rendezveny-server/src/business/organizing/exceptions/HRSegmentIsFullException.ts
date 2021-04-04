import { BusinessException } from '../../utils/BusinessException';

export class HRSegmentIsFullException extends BusinessException {
	public constructor() {
		super('HRSEGMENT_IS_FULL', 'HR segment is full', {});
	}
}
