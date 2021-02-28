import { BaseManager, Manager } from '../utils/BaseManager';
import { InjectRepository } from '@nestjs/typeorm';
import { Event } from '../../data/models/Event';
import { FilledInForm, Form, ModifiedForm } from './Form';
import { FormQuestion, FormQuestionMetadata, FormQuestionType } from '../../data/models/FormQuestion';
import { FormQuestionAnswer, FormQuestionAnswerObject } from '../../data/models/FormQuestionAnswer';
import {
	AuthContext,
	AuthEvent,
	AuthorizeGuard,
	AuthRegistration,
	IsChiefOrganizer,
	IsOrganizer,
	IsRegistered
} from '../auth/AuthorizeGuard';
import { EventContext } from '../auth/tokens/EventToken';
import { FormInvalidFormInputException } from './exceptions/FormInvalidFormInputException';
import { Registration } from '../../data/models/Registration';
import { FormRequiredQuestionNotAnsweredException } from './exceptions/FormRequiredQuestionNotAnsweredException';
import { FormInvalidFormAnswerException } from './exceptions/FormInvalidFormAnswerException';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import {
	EventRepository,
	FormQuestionAnswerRepository,
	FormQuestionRepository
} from '../../data/repositories/repositories';

@Manager()
export class FormManager extends BaseManager {
	public constructor(
		@InjectRepository(EventRepository) private readonly eventRepository: EventRepository,
		@InjectRepository(FormQuestionRepository) private readonly formQuestionRepository: FormQuestionRepository,
		@InjectRepository(FormQuestionAnswerRepository)
		private readonly formAnswerRepository: FormQuestionAnswerRepository
	) {
		super();
	}

	public async getForm(event: Event): Promise<Form> {
		const questions = (await this.formQuestionRepository.find({ event })).sort((q1, q2) => q1.order - q2.order);
		return {
			questions: questions.map((question) => ({
				id: question.id,
				question: question.question,
				isRequired: question.isRequired,
				data: question.typeMetadata
			}))
		};
	}

	@Transactional()
	@AuthorizeGuard(IsChiefOrganizer())
	public async modifyForm(
		@AuthContext() _eventContext: EventContext,
		@AuthEvent() event: Event,
		form: ModifiedForm
	): Promise<Form> {
		const questions = (await this.formQuestionRepository.find({ event })).sort((q1, q2) => q1.order - q2.order);

		const deletedQuestions = questions.filter((q) => !form.questions.map((q2) => q2.id).some((id) => id === q.id));
		await this.formQuestionRepository.remove(deletedQuestions);

		const modifiedQuestions: FormQuestion[] = [];
		for (const question of form.questions) {
			if (typeof question.id === 'string') {
				const origQuestion = questions.find((q) => q.id === question.id);
				if (origQuestion) {
					origQuestion.isRequired = question.isRequired;
					origQuestion.typeMetadata = question.data;
					modifiedQuestions.push(origQuestion);
				} else {
					throw new FormInvalidFormInputException();
				}
			} else {
				modifiedQuestions.push(
					new FormQuestion({
						question: question.question,
						isRequired: question.isRequired,
						type: FormManager.getFormQuestionTypeFromMetadata(question.data),
						typeMetadata: question.data,
						event: event,
						order: -1
					})
				);
			}
		}

		for (const [idx, question] of modifiedQuestions.entries()) {
			question.order = idx;
		}

		await this.formQuestionRepository.save(modifiedQuestions);

		return {
			questions: modifiedQuestions.map((question) => ({
				id: question.id,
				question: question.question,
				isRequired: question.isRequired,
				data: question.typeMetadata
			}))
		};
	}

	@AuthorizeGuard(IsRegistered(), IsOrganizer(), IsChiefOrganizer())
	public async getFilledInForm(
		@AuthContext() eventContext: EventContext,
		@AuthEvent() event: Event,
		@AuthRegistration() registration: Registration
	): Promise<FilledInForm> {
		const answers = (await this.formAnswerRepository.find({ registration })).sort(
			(a1, a2) => a1.formQuestion.order - a2.formQuestion.order
		);

		return {
			answers: answers.map((answer) => ({
				id: answer.formQuestion.id,
				answer: answer.answer
			}))
		};
	}

	@Transactional()
	public async fillInForm(event: Event, registration: Registration, form: FilledInForm): Promise<FilledInForm> {
		return this.doFillInForm(event, registration, form);
	}

	@Transactional()
	@AuthorizeGuard(IsRegistered(), IsOrganizer(), IsChiefOrganizer())
	public async modifyFilledInForm(
		@AuthContext() eventContext: EventContext,
		@AuthEvent() event: Event,
		@AuthRegistration() registration: Registration,
		form: FilledInForm
	): Promise<FilledInForm> {
		await this.formAnswerRepository.delete({ registration });

		return this.doFillInForm(event, registration, form);
	}

	private async doFillInForm(event: Event, registration: Registration, form: FilledInForm): Promise<FilledInForm> {
		const questions = (await this.formQuestionRepository.find({ event })).sort((q1, q2) => q1.order - q2.order);

		if (
			questions.filter((q) => q.isRequired).some((q) => !form.answers.map((a) => a.id).some((id) => q.id === id))
		) {
			throw new FormRequiredQuestionNotAnsweredException();
		}

		const answers: FormQuestionAnswer[] = [];
		for (const answer of form.answers) {
			const question = questions.find((q) => q.id === answer.id);
			if (question) {
				answers.push(
					new FormQuestionAnswer({
						registration: registration,
						formQuestion: question,
						answer: FormManager.validateFormQuestionAnswer(answer.answer, question.typeMetadata)
					})
				);
			} else {
				throw new FormInvalidFormInputException();
			}
		}

		await this.formAnswerRepository.save(answers);

		return {
			answers: answers.map((answer) => ({
				id: answer.formQuestion.id,
				answer: answer.answer
			}))
		};
	}

	private static getFormQuestionTypeFromMetadata(formQuestion: FormQuestionMetadata): FormQuestionType {
		switch (formQuestion.type) {
			case 'text':
				return FormQuestionType.TEXT;
			case 'multiple_choice':
				return FormQuestionType.MULTIPLE_CHOICE;
		}
	}

	private static validateFormQuestionAnswer(
		formAnswer: FormQuestionAnswerObject,
		formQuestion: FormQuestionMetadata
	): FormQuestionAnswerObject {
		switch (formQuestion.type) {
			case 'text':
				if (formAnswer.type === formQuestion.type && formAnswer.text.length <= formQuestion.maxLength) {
					return formAnswer;
				} else {
					throw new FormInvalidFormAnswerException();
				}
			case 'multiple_choice':
				if (formAnswer.type === formQuestion.type) {
					if (
						!formAnswer.options.some(
							(option) => !formQuestion.options.map((o) => o.id).some((id) => id === option)
						)
					) {
						if (formQuestion.multipleAnswers || formAnswer.options.length === 1) {
							return formAnswer;
						}
					}
				}

				throw new FormInvalidFormAnswerException();
		}
	}
}
