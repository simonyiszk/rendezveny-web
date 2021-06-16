import { User } from '../../data/models/User';
import { TemporaryIdentity } from '../../data/models/TemporaryIdentity';
import { Registration } from '../../data/models/Registration';
import { Organizer } from '../../data/models/Organizer';

/* eslint-disable no-magic-numbers */
export enum EventRelationType {
	NONE = 0,
	REGISTERED = 1 << 0,
	ATTENDED = 1 << 1,
	ORGANIZER = 1 << 2,
	CHIEF_ORGANIZER = 1 << 3,
	HOSTING_MEMBER = 1 << 4,
	HOSTING_MANAGER = 1 << 5
}
/* eslint-enable no-magic-numbers */

export class EventRelation {
	public readonly user: User | TemporaryIdentity;
	private readonly relation: EventRelationType;
	private readonly registration?: Registration;
	private readonly organizer?: Organizer;

	public constructor(
		user: User | TemporaryIdentity,
		relation: EventRelationType,
		registration?: Registration,
		organizer?: Organizer
	) {
		this.user = user;
		this.relation = relation;
		this.registration = registration;
		this.organizer = organizer;
	}

	public isRegistered(): boolean {
		return (this.relation & EventRelationType.REGISTERED) === EventRelationType.REGISTERED;
	}

	public getRegistration(): Registration {
		return this.registration!;
	}

	public didAttend(): boolean {
		return (this.relation & EventRelationType.ATTENDED) === EventRelationType.ATTENDED;
	}

	public isHostingClubMember(): boolean {
		return (this.relation & EventRelationType.HOSTING_MEMBER) === EventRelationType.HOSTING_MEMBER;
	}

	public isHostingClubManager(): boolean {
		return (this.relation & EventRelationType.HOSTING_MANAGER) === EventRelationType.HOSTING_MANAGER;
	}

	public isOrganizer(): boolean {
		return (this.relation & EventRelationType.ORGANIZER) === EventRelationType.ORGANIZER;
	}

	public getOrganizerId(): string | undefined {
		return this.organizer?.id;
	}

	public isChiefOrganizer(): boolean {
		return (this.relation & EventRelationType.CHIEF_ORGANIZER) === EventRelationType.CHIEF_ORGANIZER;
	}
}
