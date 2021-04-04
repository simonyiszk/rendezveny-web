import { BusinessException } from '../../utils/BusinessException';

export class HRSegmentDoesNotExistsException extends BusinessException {
	public constructor() {
		super('HRSEGMENT_DOES_NOT_EXIST', 'HR segment does not exist', {});
	}
}
