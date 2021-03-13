// eslint-disable-next-line max-classes-per-file
import { Field, ObjectType } from '@nestjs/graphql';
import { PaginatedDTO } from '../utils/PaginatedDTO';
import { EventRegistrationFormDTO } from './EventRegistrationFormDTO';
import { HRTableDTO } from './HRTableDTO';
import { EventRelationDTO } from './EventRelationDTO';
import { ClubDTO } from './ClubDTO';
import { EventRegistrationFormQuestionAnswersDTO } from './EventRegistrationFormAnswerDTO';

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
		description: 'The unique name of the event'
	})
	public uniqueName: string = '';

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
		description: 'The capacity of the event',
		nullable: true
	})
	public capacity?: number;

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
		description: 'Indicates whether registration is allowed for the event',
		nullable: true
	})
	public registrationAllowed?: boolean;

	@Field({
		description: 'Describes whether the event is closed',
		defaultValue: false
	})
	public isClosedEvent: boolean = false;

	@Field((_) => [EventRelationDTO], {
		description: 'The users in relation with the event'
	})
	public relations?: EventRelationDTO[];

	@Field((_) => [ClubDTO], {
		description: 'The hosting clubs of the event'
	})
	public hostingClubs?: ClubDTO[];

	@Field((_) => EventRelationDTO, {
		description: "The current user's relation with the event (event token)"
	})
	public selfRelation?: EventRelationDTO;

	@Field((_) => EventRelationDTO, {
		description: "The current user's relation with the event (access token)"
	})
	public selfRelation2?: EventRelationDTO;

	@Field((_) => EventRegistrationFormDTO, {
		description: 'The registration form of the event'
	})
	public registrationForm?: EventRegistrationFormDTO;

	@Field((_) => EventRegistrationFormQuestionAnswersDTO, {
		description: 'The registration form of the event'
	})
	public registrationFormAnswers?: EventRegistrationFormQuestionAnswersDTO;

	@Field((_) => HRTableDTO, {
		description: 'The HRTable of the event',
		nullable: true
	})
	public hrTable?: HRTableDTO;

	@Field((_) => Number, {
		description: 'Number of already registered users',
		nullable: true
	})
	public alreadyRegistered?: number;
}

@ObjectType({
	description: 'Paginated data of events'
})
export class PaginatedEventDTO extends PaginatedDTO(EventDTO) {}
