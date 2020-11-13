import { Column, Entity, Generated, JoinColumn, ManyToOne, OneToMany, PrimaryColumn } from 'typeorm';
import { nameof } from '../../utils/nameof';
import { Event } from './Event';
import { FormQuestionAnswer } from './FormQuestionAnswer';

export enum FormQuestionType {
	TEXT,
	MULTIPLE_CHOICE
}

export interface TextFormQuestionMetadata {
	type: 'text';
	maxLength: number;
}

export interface MultipleChoiceFormQuestionMetadata {
	type: 'multiple_choice';
	options: { id: string, text: string }[];
	multipleAnswers: boolean;
}

export type FormQuestionMetadata = TextFormQuestionMetadata | MultipleChoiceFormQuestionMetadata;

@Entity()
export class FormQuestion {
	@PrimaryColumn()
	@Generated('uuid')
	public readonly id!: string;

	@Column()
	public question!: string;

	@Column()
	public isRequired!: boolean;

	@Column({ type: 'enum', enum: FormQuestionType })
	public type!: FormQuestionType;

	@Column({ type: 'json' })
	public typeMetadata!: FormQuestionMetadata;

	@Column()
	public order!: number;

	@Column()
	public readonly eventId?: string;

	@ManyToOne(_ => Event, event => event.formQuestions, { eager: true })
	@JoinColumn({ name: nameof<FormQuestion>('eventId') })
	public event!: Event;

	@OneToMany(_ => FormQuestionAnswer, answer => answer.formQuestion)
	public answers!: FormQuestionAnswer[];

	public constructor(params?: {
		question: string,
		isRequired: boolean,
		type: FormQuestionType,
		typeMetadata: FormQuestionMetadata,
		order: number,
		event: Event
	}) {
		if(params) {
			this.question = params.question;
			this.isRequired = params.isRequired;
			this.type = params.type;
			this.typeMetadata = params.typeMetadata;
			this.order = params.order;
			this.event = params.event;
		}
	}
}