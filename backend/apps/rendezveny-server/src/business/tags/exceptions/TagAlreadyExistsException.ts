import { BusinessException } from '../../utils/BusinessException';

export class TagAlreadyExistsException extends BusinessException {
	public constructor() {
		super(
			'TAG_ALREADY_EXISTS',
			'The tag already exists',
			{ }
		);
	}
}