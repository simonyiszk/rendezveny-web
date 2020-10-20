/* eslint-disable max-classes-per-file */
import { UserRole } from '../../data/models/UserRole';
import { ClubRole } from '../../data/models/ClubRole';
import { Club } from '../../data/models/Club';
import { User } from '../../data/models/User';

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

export class AccessContext {
	private readonly accessToken: AccessToken;

	public constructor(accessToken: AccessToken) {
		this.accessToken = accessToken;
	}

	public getUserId(): string {
		return this.accessToken.uid;
	}

	public isUser(): boolean {
		return this.accessToken.rol === UserRole.USER;
	}

	public isAdmin(): boolean {
		return this.accessToken.rol === UserRole.ADMIN;
	}

	public isManagerOfClub(club: Club): boolean {
		return this.accessToken.clb
			.filter(clb => clb.cid === club.id && clb.rol === ClubRole.CLUB_MANAGER)
			.length > 0;
	}

	public isManagerOfUser(user: User): boolean {
		return this.accessToken.clb
			.filter(clb => clb.rol === ClubRole.CLUB_MANAGER)
			.some(clb => user.memberships.map(m => m.club.id).includes(clb.cid));
	}

	public isSameUser(user: User): boolean {
		return this.accessToken.uid === user.id;
	}
}

export type Token = RefreshToken | AccessToken;