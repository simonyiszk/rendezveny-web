import { Field, ObjectType } from '@nestjs/graphql';
import { EventRegistrationFormAnswersDTO } from './EventRegistrationFormAnswerDTO';

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

	@Field(_ => EventRegistrationFormAnswersDTO, {
		description: 'The answers for the registration form'
	})
	public formAnswer?: EventRegistrationFormAnswersDTO;
}