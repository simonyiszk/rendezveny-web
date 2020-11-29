import { Field, ObjectType } from '@nestjs/graphql';
import { EventRelationDTO } from './EventRelationDTO';

@ObjectType({
	description: 'The event token response'
})
export class EventLoginDTO {
	@Field({
		description: 'The event token'
	})
	public eventToken: string = '';

	@Field(_ => EventRelationDTO, {
		description: 'The relation of the token holder to the event'
	})
	public relation!: EventRelationDTO;
}