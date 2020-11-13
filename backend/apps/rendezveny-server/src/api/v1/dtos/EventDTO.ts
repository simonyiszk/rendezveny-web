// eslint-disable-next-line max-classes-per-file
import { Field, ObjectType } from '@nestjs/graphql';
import { PaginatedDTO } from '../utils/PaginatedDTO';
import { EventRegistrationFormDTO } from './EventRegistrationFormDTO';

@ObjectType({
	description: 'The data of an event'
})
export class EventDTO {
	@Field({
		description: 'The id of an event'
	})
	public id: string = '';

	@Field({
		description: 'The name of the event'
	})
	public name: string = '';

	@Field({
		description: 'The description of the event'
	})
	public description: string = '';

	@Field({
		description: 'The place of the event',
		nullable: true
	})
	public place?: string;

	@Field({
		description: 'The start of the event',
		nullable: true
	})
	public start?: Date;

	@Field({
		description: 'The end of the event',
		nullable: true
	})
	public end?: Date;

	@Field({
		description: 'Describes whether the start and end dates are dates or datetimes',
		defaultValue: true
	})
	public isDateOrTime: boolean = true;

	@Field({
		description: 'The start of the registration period for the event',
		nullable: true
	})
	public registrationStart?: Date;

	@Field({
		description: 'The end of the of the registration period for the event',
		nullable: true
	})
	public registrationEnd?: Date;

	@Field({
		description: 'Describes whether the event is closed',
		defaultValue: false
	})
	public isClosedEvent: boolean = false;

	@Field(_ => EventRegistrationFormDTO, {
		description: 'The registration form of the event'
	})
	public registrationForm?: EventRegistrationFormDTO;
}

@ObjectType({
	description: 'Paginated data of events'
})
export class PaginatedEventDTO extends PaginatedDTO(EventDTO) {}