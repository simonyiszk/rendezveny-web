import { User } from '../../data/models/User';
import { TemporaryIdentity } from '../../data/models/TemporaryIdentity';

/* eslint-disable no-magic-numbers */
export enum EventRelationType {
	NONE = 0,
	REGISTERED = 1 << 0,
	ATTENDED = 1 << 1,
	ORGANIZER = 1 << 2,
	CHIEF_ORGANIZER = 1 << 3,
	HOSTING_MEMBER = 1 << 4
}
/* eslint-enable no-magic-numbers */

export class EventRelation {
	public readonly user: User | TemporaryIdentity;
	private readonly relation: EventRelationType;

	public constructor(user: User | TemporaryIdentity, relation: EventRelationType) {
		this.user = user;
		this.relation = relation;
	}

	public isRegistered(): boolean {
		return (this.relation & EventRelationType.REGISTERED) === EventRelationType.REGISTERED;
	}

	public didAttend(): boolean {
		return (this.relation & EventRelationType.ATTENDED) === EventRelationType.ATTENDED;
	}

	public isHostingClubMember(): boolean {
		return (this.relation & EventRelationType.HOSTING_MEMBER) === EventRelationType.HOSTING_MEMBER;
	}

	public isOrganizer(): boolean {
		return (this.relation & EventRelationType.ORGANIZER) === EventRelationType.ORGANIZER;
	}

	public isChiefOrganizer(): boolean {
		return (this.relation & EventRelationType.CHIEF_ORGANIZER) === EventRelationType.CHIEF_ORGANIZER;
	}
}