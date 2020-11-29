/* eslint-disable max-classes-per-file */
import { createUnionType, Field, InputType, ObjectType } from '@nestjs/graphql';
import { GraphQLString } from 'graphql';
import { PaginatedDTO } from '../utils/PaginatedDTO';

// eslint-disable-next-line @typescript-eslint/naming-convention
function EventRegistrationFormTypeQuestionDTO<T>(t: T) {
	@ObjectType({ isAbstract: true })
	class BaseEventRegistrationFormQuestionDTO {
		@Field(_ => GraphQLString, {
			description: 'The type of the question'
		})
		public readonly type: T = t;
	}

	return BaseEventRegistrationFormQuestionDTO;
}

@ObjectType({
	description: 'The metadata of a text question of the registration form for an event'
})
export class EventRegistrationFormTextQuestionDTO extends EventRegistrationFormTypeQuestionDTO('text') {
	@Field({
		description: 'The maximal length of the answer'
	})
	// eslint-disable-next-line no-magic-numbers
	public maxLength: number = 255;
}

@ObjectType({
	description: 'The metadata of a choice for a multiple choice question of the registration form for an event'
})
export class EventRegistrationFormMultipleChoiceOptionDTO {
	@Field({
		description: 'The id of the option'
	})
	public id: string = '';

	@Field({
		description: 'The value of the option'
	})
	public text: string = '';
}

@ObjectType({
	description: 'The metadata of a multiple choice question of the registration form for an event'
})
export class EventRegistrationFormMultipleChoiceQuestionDTO
	extends EventRegistrationFormTypeQuestionDTO('multiple_choice') {
	@Field(_ => [EventRegistrationFormMultipleChoiceOptionDTO], {
		description: 'The options'
	})
	public options?: EventRegistrationFormMultipleChoiceOptionDTO[];

	@Field({
		description: 'Indicates whether the user is allowed to select multiple answers'
	})
	public multipleAnswers: boolean = false;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const EventRegistrationFormQuestionMetadataDTO = createUnionType({
	name: 'EventRegistrationFormQuestionMetadataDTO',
	types: () => [EventRegistrationFormTextQuestionDTO, EventRegistrationFormMultipleChoiceQuestionDTO],
	resolveType: (value) => {
		switch(value.type) {
			case 'text':
				return EventRegistrationFormTextQuestionDTO;
			case 'multiple_choice':
				return EventRegistrationFormMultipleChoiceQuestionDTO;
			default:
				return null;
		}
	}
});

@ObjectType({
	description: 'The data of one question of the registration form for an event'
})
export class EventRegistrationFormQuestionDTO {
	@Field({
		description: 'The id of the question'
	})
	public id: string = '';

	@Field({
		description: 'The question'
	})
	public question: string = '';

	@Field(_ => EventRegistrationFormQuestionMetadataDTO, {
		description: 'The metadata of the question type'
	})
	public metadata?: typeof EventRegistrationFormQuestionMetadataDTO;

	@Field({
		description: 'Indicates whether the question is required or not'
	})
	public isRequired: boolean = false;
}

@ObjectType({
	description: 'The data of one question of the registration form (template)'
})
export class RegistrationFormTemplateQuestionDTO {
	@Field({
		description: 'The id of the question'
	})
	public id: string = '';

	@Field({
		description: 'The question'
	})
	public question: string = '';

	@Field(_ => EventRegistrationFormQuestionMetadataDTO, {
		description: 'The metadata of the question type'
	})
	public metadata?: typeof EventRegistrationFormQuestionMetadataDTO;
}

@ObjectType({
	description: 'The data of one question of the registration form (template)'
})
export class PaginatedRegistrationFormTemplateQuestionDTO extends PaginatedDTO(RegistrationFormTemplateQuestionDTO) {}

@ObjectType({
	description: 'The data of the registration form for an event'
})
export class EventRegistrationFormDTO {
	@Field(_ => [EventRegistrationFormQuestionDTO], {
		description: 'The questions in the form'
	})
	public questions?: EventRegistrationFormQuestionDTO[];
}

@InputType({
	description: 'The data of one question of the registration form for an event'
})
export class EventRegistrationFormQuestionInput {
	@Field({
		description: 'The id of the question',
		nullable: true
	})
	public id?: string;

	@Field({
		description: 'The question'
	})
	public question: string = '';

	@Field({
		description: 'The metadata of the question type (JSON stringified)'
	})
	public metadata: string = '';

	@Field({
		description: 'Indicates whether the question is required or not'
	})
	public isRequired: boolean = false;
}

@InputType({
	description: 'The data of the registration form for an event'
})
export class EventRegistrationFormInput {
	@Field(_ => [EventRegistrationFormQuestionInput], {
		description: 'The questions in the form'
	})
	public questions!: EventRegistrationFormQuestionInput[];
}