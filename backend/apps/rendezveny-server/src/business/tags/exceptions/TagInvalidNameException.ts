import { BusinessException } from '../../utils/BusinessException';

export class TagInvalidNameException extends BusinessException {
	public constructor() {
		super(
			'TAG_INVALID_NAME',
			'The name of the tag is invalid',
			{ }
		);
	}
}