import { BusinessException } from '../../utils/BusinessException';

export class HRTableDoesNotExistsException extends BusinessException {
	public constructor(id: string) {
		super('HRTABLE_DOES_NOT_EXISTS', `HR table for event with id ${id} does not exists`, { id });
	}
}
