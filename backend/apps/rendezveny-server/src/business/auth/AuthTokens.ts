import { UserRole } from '../../data/models/UserRole';
import { ClubRole } from '../../data/models/ClubRole';

export interface RefreshToken {
	typ: 'refresh'
	tid: string
	uid: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/explicit-module-boundary-types
export function isRefreshToken(token: any): token is RefreshToken {
	return token !== null
		&& typeof token === 'object'
		&& typeof token!.typ === 'string'
		&& token!.typ === 'refresh';
}

export interface AccessToken {
	typ: 'access'
	uid: string
	rol: UserRole
	clb: { cid: string, rol: ClubRole }[]
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/explicit-module-boundary-types
export function isAccessToken(token: any): token is AccessToken {
	return token !== null
		&& typeof token === 'object'
		&& typeof token!.typ === 'string'
		&& token!.typ === 'access';
}

export type Token = RefreshToken | AccessToken;