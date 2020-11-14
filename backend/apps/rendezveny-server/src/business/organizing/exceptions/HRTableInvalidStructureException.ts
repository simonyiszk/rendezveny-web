import { BusinessException } from '../../utils/BusinessException';

export class HRTableInvalidStructureException extends BusinessException {
	public constructor() {
		super(
			'HRTABLE_INVALID_STRUCTURE',
			'Invalid HR tabl structure',
			{}
		);
	}
}