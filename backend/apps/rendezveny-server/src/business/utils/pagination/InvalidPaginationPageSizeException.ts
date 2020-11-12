import { BusinessException } from '../BusinessException';

export class InvalidPaginationPageSizeException extends BusinessException {
	public constructor(pageSize: number) {
		super(
			'INVALID_PAGINATION_PAGE_SIZE',
			`Invalid pagination page size: 0 < expected <= 100, got: ${pageSize}`,
			{ pageSize }
		);
	}
}