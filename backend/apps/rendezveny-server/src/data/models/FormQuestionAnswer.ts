import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { nameof } from '../../utils/nameof';
import { FormQuestion } from './FormQuestion';
import { Registration } from './Registration';

export interface TextFormQuestionAnswer {
	type: 'text';
	text: string;
}

export interface MultipleChoiceFormQuestionAnswer {
	type: 'multiple_choice';
	options: string[];
}

export type FormQuestionAnswerObject = TextFormQuestionAnswer | MultipleChoiceFormQuestionAnswer;

@Entity()
export class FormQuestionAnswer {
	@PrimaryColumn()
	public readonly formQuestionId?: string;

	@ManyToOne(
		(_) => FormQuestion,
		(formQuestion) => formQuestion.answers,
		{ eager: true, onDelete: 'CASCADE' }
	)
	@JoinColumn({ name: nameof<FormQuestionAnswer>('formQuestionId') })
	public formQuestion!: FormQuestion;

	@PrimaryColumn()
	public readonly registrationId?: string;

	@ManyToOne(
		(_) => Registration,
		(registration) => registration.formAnswers,
		{ eager: true, onDelete: 'CASCADE' }
	)
	@JoinColumn({ name: nameof<FormQuestionAnswer>('registrationId') })
	public registration!: Registration;

	@Column({ type: 'json' })
	public answer!: FormQuestionAnswerObject;

	public constructor(params?: {
		formQuestion: FormQuestion;
		registration: Registration;
		answer: FormQuestionAnswerObject;
	}) {
		if (params) {
			this.formQuestion = params.formQuestion;
			this.registration = params.registration;
			this.answer = params.answer;
		}
	}
}
