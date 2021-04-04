import { UserRole } from '../../../data/models/UserRole';
import { ClubRole } from '../../../data/models/ClubRole';
import { Club } from '../../../data/models/Club';
import { User } from '../../../data/models/User';

export interface AccessToken {
	typ: 'access';
	uid: string;
	rol: UserRole;
	clb: { cid: string; rol: ClubRole }[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/explicit-module-boundary-types
export function isAccessToken(token: any): token is AccessToken {
	return token !== null && typeof token === 'object' && typeof token!.typ === 'string' && token!.typ === 'access';
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

	public isMemberOfClub(club: Club): boolean {
		return this.accessToken.clb.some((clb) => clb.cid === club.id);
	}

	public isManagerOfClub(club: Club): boolean {
		return this.accessToken.clb.some((clb) => clb.cid === club.id && clb.rol === ClubRole.CLUB_MANAGER);
	}

	public isManagerOfAnyClub(): boolean {
		return this.accessToken.clb.filter((clb) => clb.rol === ClubRole.CLUB_MANAGER).length > 0;
	}

	public isManagerOfUser(user: User): boolean {
		return this.accessToken.clb
			.filter((clb) => clb.rol === ClubRole.CLUB_MANAGER)
			.some((clb) => user.memberships.map((m) => m.club.id).includes(clb.cid));
	}

	public isSameUser(user: User): boolean {
		return this.accessToken.uid === user.id;
	}
}
