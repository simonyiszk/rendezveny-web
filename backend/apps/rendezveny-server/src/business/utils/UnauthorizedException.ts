import { BusinessException } from './BusinessException';

export class UnauthorizedException extends BusinessException {
	public constructor() {
		super(
			'UNAUTHORIZED',
			'Unauthorized to perform operation',
			{ }
		);
	}
}