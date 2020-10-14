import { checkArgument } from '../../utils/preconditions';
import { InvalidPaginationPageSizeException } from './InvalidPaginationPageSizeException';
import { InvalidPaginationOffsetException } from './InvalidPaginationOffsetException';
import { isInt } from 'class-validator';

export function checkPagination(pageSize: number, offset: number): void {
	checkArgument(isInt(pageSize), InvalidPaginationPageSizeException, pageSize);
	checkArgument(isInt(offset), InvalidPaginationOffsetException, offset);
	checkArgument(pageSize > 0, InvalidPaginationPageSizeException, pageSize);
	// eslint-disable-next-line no-magic-numbers
	checkArgument(pageSize <= 100, InvalidPaginationPageSizeException, pageSize);
	checkArgument(offset >= 0, InvalidPaginationOffsetException, offset);
}