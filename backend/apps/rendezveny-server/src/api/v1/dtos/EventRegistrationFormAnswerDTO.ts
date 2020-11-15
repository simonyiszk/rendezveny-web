/* eslint-disable max-classes-per-file */
import { createUnionType, Field, ObjectType } from '@nestjs/graphql';
import { GraphQLString } from 'graphql';

// eslint-disable-next-line @typescript-eslint/naming-convention
function EventRegistrationFormTypeAnswerDTO<T>(t: T) {
	@ObjectType({ isAbstract: true })
	class BaseEventRegistrationFormQuestionDTO {
		@Field(_ => GraphQLString, {
			description: 'The type of the answer'
		})
		public readonly type: T = t;
	}

	return BaseEventRegistrationFormQuestionDTO;
}

@ObjectType({
	description: 'The metadata of a text question of the registration form for an event'
})
export class EventRegistrationFormTextAnswerDTO extends EventRegistrationFormTypeAnswerDTO('text') {
	@Field({
		description: 'The answer'
	})
	public text: string = '';
}

@ObjectType({
	description: 'The metadata of a multiple choice question of the registration form for an event'
})
export class EventRegistrationFormMultipleChoiceAnswerDTO
	extends EventRegistrationFormTypeAnswerDTO('multiple_choice') {
	@Field(_ => [GraphQLString], {
		description: 'The chosen options'
	})
	public options: string[] = [];
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const EventRegistrationFormAnswerMetadataDTO = createUnionType({
	name: 'EventRegistrationFormAnswerMetadataDTO',
	types: () => [EventRegistrationFormTextAnswerDTO, EventRegistrationFormMultipleChoiceAnswerDTO],
	resolveType: (value) => {
		switch(value.type) {
			case 'text':
				return EventRegistrationFormTextAnswerDTO;
			case 'multiple_choice':
				return EventRegistrationFormMultipleChoiceAnswerDTO;
			default:
				return null;
		}
	}
});

@ObjectType({
	description: 'The answer for one question of the registration form for an event'
})
export class EventRegistrationFormAnswerDTO {
	@Field({
		description: 'The id of the question'
	})
	public id: string = '';

	@Field(_ => EventRegistrationFormAnswerMetadataDTO, {
		description: 'The metadata of the answer type'
	})
	public answer?: typeof EventRegistrationFormAnswerMetadataDTO;
}

@ObjectType({
	description: 'The data of the answers for a registration form of an event'
})
export class EventRegistrationFormAnswersDTO {
	@Field(_ => [EventRegistrationFormAnswerDTO], {
		description: 'The answers'
	})
	public answers?: EventRegistrationFormAnswerDTO[];
}