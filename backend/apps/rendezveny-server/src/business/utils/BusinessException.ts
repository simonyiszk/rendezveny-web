export class BusinessException extends Error {
	public constructor(
		public readonly tag: string,
		errorMessage: string,
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		public readonly payload?: unknown
	) {
		super(errorMessage);
	}
}