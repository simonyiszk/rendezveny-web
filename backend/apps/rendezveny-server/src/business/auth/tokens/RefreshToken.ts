export interface RefreshToken {
	typ: 'refresh';
	tid: string;
	uid: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/explicit-module-boundary-types
export function isRefreshToken(token: any): token is RefreshToken {
	return token !== null && typeof token === 'object' && typeof token!.typ === 'string' && token!.typ === 'refresh';
}

export class RefreshContext {
	private readonly refreshToken: RefreshToken;

	public constructor(refreshToken: RefreshToken) {
		this.refreshToken = refreshToken;
	}

	public getTokenId(): string {
		return this.refreshToken.tid;
	}

	public getUserId(): string {
		return this.refreshToken.uid;
	}
}
