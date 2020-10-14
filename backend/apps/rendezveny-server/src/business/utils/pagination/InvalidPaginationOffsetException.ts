import { BusinessException } from '../BusinessException';

export class InvalidPaginationOffsetException extends BusinessException {
	public constructor(offset: number) {
		super(
			'INVALID_PAGINATION_OFFSET',
			`Invalid pagination offset: expected >= 0, got: ${offset}`,
			{ offset }
		);
	}
}