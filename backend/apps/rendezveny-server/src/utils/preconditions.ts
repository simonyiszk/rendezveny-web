export function checkNotNull<T>(
	value: T | undefined | null
): T;
export function checkNotNull<T>(
	value: T | undefined | null, exceptionType: new () => unknown
): T;
export function checkNotNull<T>(
	value: T | undefined | null, errorMessage: string
): T;
export function checkNotNull<T>(
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	value: T | undefined | null, exceptionType: new (...params: any[]) => unknown, ...params: unknown[]
): T;
export function checkNotNull<T>(
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	value: T | undefined | null, messageOrException?: string | (new (...params: any[]) => unknown),
	...params: unknown[]
): T {
	// eslint-disable-next-line no-undefined
	if(value === null || value === undefined) {
		if(typeof messageOrException === 'undefined') {
			throw new Error('Argument check failed');
		}
		else if(typeof messageOrException === 'string') {
			throw new Error(messageOrException);
		}
		else if(params.length > 0) {
			throw new messageOrException(...params);
		}
		else {
			throw new messageOrException();
		}
	}
	else {
		return value;
	}
}

export function checkArgument(
	value: boolean
): void;
export function checkArgument(
	value: boolean, exceptionType: new () => unknown
): void;
export function checkArgument(
	value: boolean, errorMessage: string
): void;
export function checkArgument(
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	value: boolean, exceptionType: new (...params: any[]) => unknown, ...params: unknown[]
): void;
export function checkArgument(
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	value: boolean, messageOrException?: string | (new (...params: any[]) => unknown), ...params: unknown[]
): void {
	if(!value) {
		if(typeof messageOrException === 'undefined') {
			throw new Error('Argument check failed');
		}
		else if(typeof messageOrException === 'string') {
			throw new Error(messageOrException);
		}
		else if(params.length > 0) {
			throw new messageOrException(...params);
		}
		else {
			throw new messageOrException();
		}
	}
}