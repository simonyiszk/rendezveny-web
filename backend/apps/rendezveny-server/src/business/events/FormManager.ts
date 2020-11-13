import { BaseManager, Manager } from '../utils/BaseManager';
import { InjectRepository } from '@nestjs/typeorm';
import { Event } from '../../data/models/Event';
import { Repository, Transaction, TransactionRepository } from 'typeorm';
import { Organizer } from '../../data/models/Organizer';
import { User } from '../../data/models/User';
import { TemporaryIdentity } from '../../data/models/TemporaryIdentity';
import { FilledInForm, Form, ModifiedForm } from './Form';
import { FormQuestion, FormQuestionMetadata, FormQuestionType } from '../../data/models/FormQuestion';
import { FormQuestionAnswer, FormQuestionAnswerObject } from '../../data/models/FormQuestionAnswer';
import {
	AuthContext,
	AuthEvent,
	AuthorizeGuard, AuthRegistration,
	IsChiefOrganizer,
	IsOrganizer,
	IsRegistered
} from '../auth/AuthorizeGuard';
import { EventContext } from '../auth/tokens/EventToken';
import { FormInvalidFormInputException } from './exceptions/FormInvalidFormInputException';
import { Registration } from '../../data/models/Registration';
import { FormRequiredQuestionNotAnsweredException } from './exceptions/FormRequiredQuestionNotAnsweredException';
import { FormInvalidFormAnswerException } from './exceptions/FormInvalidFormAnswerException';
import { checkPermission } from '../utils/permissions/CheckPermissions';

@Manager()
export class FormManager extends BaseManager {
	public constructor(
		@InjectRepository(Event) private readonly eventRepository: Repository<Event>,
		@InjectRepository(Organizer) private readonly organizerRepository: Repository<Organizer>,
		@InjectRepository(User) private readonly userRepository: Repository<User>,
		@InjectRepository(TemporaryIdentity) private readonly tempIdentityRepository: Repository<TemporaryIdentity>,
		@InjectRepository(FormQuestion) private readonly formQuestionRepository: Repository<FormQuestion>,
		@InjectRepository(FormQuestionAnswer) private readonly formAnswerRepository: Repository<FormQuestionAnswer>
	) {
		super();
	}

	public async getForm(
		event: Event
	): Promise<Form> {
		const questions = (await this.formQuestionRepository.find({ event })).sort((q1, q2) => q1.order - q2.order);
		return {
			questions: questions.map(question => ({
				id: question.id,
				question: question.question,
				isRequired: question.isRequired,
				data: question.typeMetadata
			}))
		};
	}

	@Transaction()
	@AuthorizeGuard(IsChiefOrganizer())
	public async modifyForm(
		@AuthContext() _eventContext: EventContext,
		@AuthEvent() event: Event,
		form: ModifiedForm,
		@TransactionRepository(FormQuestion) formQuestionRepository?: Repository<FormQuestion>
	): Promise<Form> {
		const questions = (await formQuestionRepository!.find({ event })).sort((q1, q2) => q1.order - q2.order);

		const deletedQuestions = questions.filter(q => !form.questions.map(q2 => q2.id).some(id => id === q.id));
		await formQuestionRepository!.remove(deletedQuestions);

		const modifiedQuestions: FormQuestion[] = [];
		for(const question of form.questions) {
			if(typeof question.id === 'string') {
				const origQuestion = questions.find(q => q.id === question.id);
				if(origQuestion) {
					origQuestion.isRequired = question.isRequired;
					origQuestion.typeMetadata = question.data;
					modifiedQuestions.push(origQuestion);
				}
				else {
					throw new FormInvalidFormInputException();
				}
			}
			else {
				modifiedQuestions.push(new FormQuestion({
					question: question.question,
					isRequired: question.isRequired,
					type: FormManager.getFormQuestionTypeFromMetadata(question.data),
					typeMetadata: question.data,
					event: event,
					order: -1
				}));
			}
		}

		for(const [idx, question] of modifiedQuestions.entries()) {
			question.order = idx;
		}

		await formQuestionRepository!.save(modifiedQuestions);

		return {
			questions: modifiedQuestions.map(question => ({
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
		registration: Registration
	): Promise<FilledInForm> {
		checkPermission(!eventContext.isRegistered(event) || registration.id === eventContext.getRegistrationId());

		const answers = (await this.formAnswerRepository.find({ registration }))
			.sort((a1, a2) => a1.formQuestion.order - a2.formQuestion.order);

		return {
			answers: answers.map(answer => ({
				id: answer.formQuestion.id,
				answer: answer.answer
			}))
		};
	}

	@Transaction()
	public async fillInForm(
		event: Event,
		registration: Registration,
		form: FilledInForm,
		@TransactionRepository(FormQuestion) formQuestionRepository?: Repository<FormQuestion>,
		@TransactionRepository(FormQuestionAnswer) formAnswerRepository?: Repository<FormQuestionAnswer>
	): Promise<FilledInForm> {
		return this.doFillInForm(event, registration, form, formQuestionRepository, formAnswerRepository);
	}

	@Transaction()
	@AuthorizeGuard(IsRegistered(), IsOrganizer(), IsChiefOrganizer())
	public async modifyFilledInForm(
		@AuthContext() eventContext: EventContext,
		@AuthEvent() event: Event,
		@AuthRegistration() registration: Registration,
		form: FilledInForm,
		@TransactionRepository(FormQuestion) formQuestionRepository?: Repository<FormQuestion>,
		@TransactionRepository(FormQuestionAnswer) formAnswerRepository?: Repository<FormQuestionAnswer>
	): Promise<FilledInForm> {
		await formAnswerRepository!.delete({ registration });

		return this.doFillInForm(event, registration, form, formQuestionRepository, formAnswerRepository);
	}

	private async doFillInForm(
		event: Event,
		registration: Registration,
		form: FilledInForm,
		formQuestionRepository?: Repository<FormQuestion>,
		formAnswerRepository?: Repository<FormQuestionAnswer>
	): Promise<FilledInForm> {
		const questions = (await formQuestionRepository!.find({ event })).sort((q1, q2) => q1.order - q2.order);

		if(questions.filter(q => q.isRequired).some(q => !form.answers.map(a => a.id).some(id => q.id === id))) {
			throw new FormRequiredQuestionNotAnsweredException();
		}

		const answers: FormQuestionAnswer[] = [];
		for(const answer of form.answers) {
			const question = questions.find(q => q.id === answer.id);
			if(question) {
				answers.push(new FormQuestionAnswer({
					registration: registration,
					formQuestion: question,
					answer: FormManager.validateFormQuestionAnswer(answer.answer, question.typeMetadata)
				}));
			}
			else {
				throw new FormInvalidFormInputException();
			}
		}

		await formAnswerRepository!.save(answers);

		return {
			answers: answers.map(answer => ({
				id: answer.formQuestion.id,
				answer: answer.answer
			}))
		};
	}

	private static getFormQuestionTypeFromMetadata(formQuestion: FormQuestionMetadata): FormQuestionType {
		switch(formQuestion.type) {
			case 'text':
				return FormQuestionType.TEXT;
			case 'multiple_choice':
				return FormQuestionType.MULTIPLE_CHOICE;
		}
	}

	private static validateFormQuestionAnswer(
		formAnswer: FormQuestionAnswerObject, formQuestion: FormQuestionMetadata
	): FormQuestionAnswerObject {
		switch(formQuestion.type) {
			case 'text':
				if(formAnswer.type === formQuestion.type && formAnswer.text.length <= formQuestion.maxLength) {
					return formAnswer;
				}
				else {
					throw new FormInvalidFormAnswerException();
				}
			case 'multiple_choice':
				if(formAnswer.type === formQuestion.type) {
					if(
						!formAnswer.options.some(
							option => !formQuestion.options.map(o => o.id).some(id => id === option)
						)
					) {
						if(formQuestion.multipleAnswers || formAnswer.options.length === 1) {
							return formAnswer;
						}
					}
				}

				throw new FormInvalidFormAnswerException();
		}
	}
}

