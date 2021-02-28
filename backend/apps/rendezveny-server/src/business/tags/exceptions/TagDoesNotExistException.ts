import { BusinessException } from '../../utils/BusinessException';

export class TagDoesNotExistException extends BusinessException {
	public constructor(name: string) {
		super('TAG_DOES_NOT_EXISTS', `The tag with name: "${name}" does not exist`, { name });
	}
}
