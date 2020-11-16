import { Field, ObjectType } from '@nestjs/graphql';
import { GraphQLString } from 'graphql';

@ObjectType({
	description: 'The data of an organizer for an event'
})
export class EventOrganizerDTO {
	@Field({
		description: 'The id of the organizer',
		nullable: true
	})
	public id?: string;

	@Field({
		description: 'Indicates whether the user is a chief organizer for the event'
	})
	public isChiefOrganizer: boolean = false;

	@Field(_ => [GraphQLString], {
		description: 'The segments the organizer is assigned to'
	})
	public hrSegmentIds?: string[];
}