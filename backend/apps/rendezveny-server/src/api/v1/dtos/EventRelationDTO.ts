// eslint-disable-next-line max-classes-per-file
import { Field, ObjectType } from '@nestjs/graphql';
import { PaginatedDTO } from '../utils/PaginatedDTO';

@ObjectType({
	description: 'The data of a registration for an event'
})
export class EventRegistrationDTO {
	@Field({
		description: 'The registration id'
	})
	public id: string = '';

	@Field({
		description: 'Indicates whether the user attended the event'
	})
	public didAttend: boolean = false;
}

@ObjectType({
	description: 'The data of an organizer for an event'
})
export class EventOrganizerDTO {
	@Field({
		description: 'Indicates whether the user is a chief organizer for the event'
	})
	public isChiefOrganizer: boolean = false;
}

@ObjectType({
	description: 'The data of a user in relation to an event'
})
export class EventRelationDTO {
	@Field({
		description: 'The name of the user'
	})
	public name: string = '';

	@Field({
		description: 'The email of the user'
	})
	public email: string = '';

	@Field({
		description: 'The id of the user in relation with the event (null if the user is temporary)',
		nullable: true
	})
	public userId?: string;

	@Field({
		description: 'Indicates whether the user is a member of one of the organizer clubs'
	})
	public isMemberOfHostingClub: boolean = false;

	@Field(_ => EventRegistrationDTO, {
		description: 'Describes the registration (if any)',
		nullable: true
	})
	public registration?: EventRegistrationDTO;

	@Field(_ => EventOrganizerDTO, {
		description: 'Describes the organizer (if any)',
		nullable: true
	})
	public organizer?: EventOrganizerDTO;
}

@ObjectType({
	description: 'Paginated data of event relations'
})
export class PaginatedEventRelationDTO extends PaginatedDTO(EventRelationDTO) {}
