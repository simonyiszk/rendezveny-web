import { BusinessException } from '../../utils/BusinessException';

export class HRTableAlreadyExistsException extends BusinessException {
	public constructor() {
		super('HRTABLE_ALREADY_EXISTS', 'HR table already exists', {});
	}
}
