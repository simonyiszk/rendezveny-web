import { Event } from '../../../data/models/Event';

export interface EventToken {
	typ: 'event';
	eid: string;
	reg: 'none' | { rid: string; uid: string; typ: 'tmp' | 'per' };
	org: 'none' | { uid: string; chf: boolean; typ: 'tmp' | 'per' };
	rol: { adm: boolean; man: boolean };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/explicit-module-boundary-types
export function isEventToken(token: any): token is EventToken {
	return token !== null && typeof token === 'object' && typeof token!.typ === 'string' && token!.typ === 'event';
}

export class EventContext {
	private readonly eventToken: EventToken;

	public constructor(eventToken: EventToken) {
		this.eventToken = eventToken;
	}

	public getEventId(): string {
		return this.eventToken.eid;
	}

	public isRegistered(event: Event): boolean {
		return this.eventToken.eid === event.id && this.eventToken.reg !== 'none';
	}

	public getRegistrationId(): string {
		if (this.eventToken.reg === 'none') {
			throw new Error();
		} else {
			return this.eventToken.reg.rid;
		}
	}

	public isRegistrationPermanent(event: Event): boolean {
		if (this.eventToken.reg === 'none') {
			throw new Error();
		} else {
			return this.eventToken.eid === event.id && this.eventToken.reg.typ === 'per';
		}
	}

	public isOrganizer(event: Event): boolean {
		return this.eventToken.eid === event.id && this.eventToken.org !== 'none';
	}

	public getUserId(): string {
		if (this.eventToken.org !== 'none') {
			return this.eventToken.org.uid;
		} else if (this.eventToken.reg !== 'none') {
			return this.eventToken.reg.uid;
		} else {
			throw new Error();
		}
	}

	public isOrganizerPermanent(): boolean {
		if (this.eventToken.org === 'none') {
			throw new Error();
		} else {
			return this.eventToken.org.typ === 'per';
		}
	}

	public isChiefOrganizer(event: Event): boolean {
		if (this.eventToken.org === 'none') {
			throw new Error();
		} else {
			return this.eventToken.eid === event.id && this.eventToken.org.chf;
		}
	}

	public isAdmin(): boolean {
		return this.eventToken.rol.adm;
	}

	public isManagerOfHost(): boolean {
		return this.eventToken.rol.man;
	}
}
