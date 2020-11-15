import { Field, ObjectType } from '@nestjs/graphql';
import { HRSegmentDTO } from './HRTableDTO';

@ObjectType({
	description: 'The data of an organizer for an event'
})
export class EventOrganizerDTO {
	@Field({
		description: 'The id of the organizer'
	})
	public id: string = '';

	@Field({
		description: 'Indicates whether the user is a chief organizer for the event'
	})
	public isChiefOrganizer: boolean = false;

	@Field(_ => [HRSegmentDTO], {
		description: 'The segments the organizer is assigned to'
	})
	public hrSegments?: HRSegmentDTO;
}