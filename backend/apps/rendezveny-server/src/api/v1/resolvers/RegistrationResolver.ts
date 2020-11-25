import { Args, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { PaginatedEventDTO } from '../dtos/EventDTO';
import { UseFilters, UseGuards, UseInterceptors } from '@nestjs/common';
import { BusinessExceptionFilter } from '../utils/BusinessExceptionFilter';
import { EventManager } from '../../../business/events/EventManager';
import { EventContext } from '../../../business/auth/tokens/EventToken';
import { AuthEventGuard, EventCtx } from '../../../business/auth/passport/AuthEventJwtStrategy';
import { nameof } from '../../../utils/nameof';
import { FormManager } from '../../../business/registration/FormManager';
import { EventRegistrationDTO } from '../dtos/EventRegistrationDTO';
import {
	EventRegistrationFormAnswerMetadataDTO,
	EventRegistrationFormAnswersDTO, EventRegistrationFormAnswersInput
} from '../dtos/EventRegistrationFormAnswerDTO';
import { RegistrationManager } from '../../../business/registration/RegistrationManager';
import { GraphQLBoolean } from 'graphql';
import { AccessCtx, AuthAccessGuard } from '../../../business/auth/passport/AuthAccessJwtStrategy';
import { AccessContext } from '../../../business/auth/tokens/AccessToken';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { LoggingInterceptor } from '../../../business/log/LoggingInterceptor';

@Resolver((_: never) => EventRegistrationDTO)
@UseInterceptors(LoggingInterceptor)
export class RegistrationResolver {
	public constructor(
		private readonly eventManager: EventManager,
		private readonly registrationManager: RegistrationManager,
		private readonly formManager: FormManager
	) {}

	@Query(_ => EventRegistrationDTO, {
		name: 'registration_getOne',
		description: 'Gets one registration by its id'
	})
	@UseFilters(BusinessExceptionFilter)
	@UseGuards(AuthEventGuard)
	public async getFormAnswers(
		@EventCtx() eventContext: EventContext,
		@Args('id', { description: 'The id of the registration' }) id: string
	): Promise<EventRegistrationDTO> {
		const event = await this.eventManager.getEventById(eventContext.getEventId());
		const registration = await this.registrationManager.getRegistrationById(eventContext, event, id);
		return {
			id: registration.id,
			didAttend: typeof registration.attendDate === 'object'
		};
	}

	@Mutation(_ => EventRegistrationDTO, {
		name: 'registration_registerSelf',
		description: 'Registers the current user to the event'
	})
	@UseFilters(BusinessExceptionFilter)
	@UseGuards(AuthAccessGuard)
	@Transactional()
	public async registerSelf(
		@AccessCtx() accessContext: AccessContext,
		@Args('eventId', { description: 'The id of the event to register for' }) eventId: string,
		@Args('filledInForm', {
			description: 'The filled in form',
			type: () => EventRegistrationFormAnswersInput
		}) filledInForm: EventRegistrationFormAnswersInput
	): Promise<EventRegistrationDTO> {
		const event = await this.eventManager.getEventById(eventId);

		const registration = await this.registrationManager.registerSelf(
			accessContext, event, {
				answers: filledInForm.answers.map(answer => ({
					id: answer.id,
					answer: JSON.parse(answer.answer)
				}))
			}
		);
		
		return {
			id: registration.id,
			didAttend: Boolean(registration.attendDate)
		};
	}

	@Mutation(_ => EventRegistrationDTO, {
		name: 'registration_registerUser',
		description: 'Registers an user by an organizer'
	})
	@UseFilters(BusinessExceptionFilter)
	@UseGuards(AuthEventGuard)
	@Transactional()
	public async registerUser(
		@EventCtx() eventContext: EventContext,
		@Args('eventId', { description: 'The id of the event to register for' }) eventId: string,
		@Args('userId', { description: 'The id of the user to register' }) userId: string,
		@Args('filledInForm', {
			description: 'The filled in form',
			type: () => EventRegistrationFormAnswersInput,
			nullable: true
		}) filledInForm?: EventRegistrationFormAnswersInput
	): Promise<EventRegistrationDTO> {
		const event = await this.eventManager.getEventById(eventId);

		const registration = await this.registrationManager.registerUserByOrganizer(
			eventContext,
			event,
			userId,
			filledInForm
				? {
					answers: filledInForm.answers.map(answer => ({
						id: answer.id,
						answer: JSON.parse(answer.answer)
					}))
				}
				: undefined
		);

		return {
			id: registration.id,
			didAttend: Boolean(registration.attendDate)
		};
	}

	@Mutation(_ => GraphQLBoolean, {
		name: 'registration_setAttendState',
		description: 'Sets the attending information for the registration'
	})
	@UseFilters(BusinessExceptionFilter)
	@UseGuards(AuthEventGuard)
	@Transactional()
	public async attendRegistration(
		@EventCtx() eventContext: EventContext,
		@Args('id', { description: 'The id of the registration' }) id: string,
		@Args('attended', { description: 'The attend state of the registration' }) attended: boolean
	): Promise<boolean> {
		const event = await this.eventManager.getEventById(eventContext.getEventId());
		const registration = await this.registrationManager.getRegistrationById(eventContext, event, id);
		if(attended) {
			await this.registrationManager.attendRegistree(eventContext, event, registration);
		}
		else {
			await this.registrationManager.unattendRegistree(eventContext, event, registration);
		}
		return true;
	}

	@Mutation(_ => EventRegistrationFormAnswersDTO, {
		name: 'registration_modifyFilledInForm',
		description: 'Modifies the registration form'
	})
	@UseFilters(BusinessExceptionFilter)
	@UseGuards(AuthEventGuard)
	@Transactional()
	public async setRegistrationForm(
		@EventCtx() eventContext: EventContext,
		@Args('id', { description: 'The id of the registration' }) id: string,
		@Args('filledInForm', {
			description: 'The filled in form',
			type: () => EventRegistrationFormAnswersInput
		}) filledInForm: EventRegistrationFormAnswersInput
	): Promise<EventRegistrationFormAnswersDTO> {
		const event = await this.eventManager.getEventById(eventContext.getEventId());
		const registration = await this.registrationManager.getRegistrationById(eventContext, event, id);

		const modifiedFilledInForm = await this.formManager.modifyFilledInForm(eventContext, event, registration, {
			answers: filledInForm.answers.map(answer => ({
				id: answer.id,
				answer: JSON.parse(answer.answer)
			}))
		});

		return {
			answers: modifiedFilledInForm.answers.map(answer => ({
				id: answer.id,
				answer: answer.answer as typeof EventRegistrationFormAnswerMetadataDTO
			}))
		};
	}

	@Mutation(_ => GraphQLBoolean, {
		name: 'registration_deleteOne',
		description: 'Deletes the registration'
	})
	@UseFilters(BusinessExceptionFilter)
	@UseGuards(AuthEventGuard)
	@Transactional()
	public async deleteRegistration(
		@EventCtx() eventContext: EventContext,
		@Args('id', { description: 'The id of the registration' }) id: string
	): Promise<boolean> {
		const event = await this.eventManager.getEventById(eventContext.getEventId());
		const registration = await this.registrationManager.getRegistrationById(eventContext, event, id);
		await this.registrationManager.deleteRegistration(eventContext, event, registration);
		return true;
	}


	@ResolveField(nameof<EventRegistrationDTO>('formAnswer'), _ => EventRegistrationFormAnswersDTO)
	@UseFilters(BusinessExceptionFilter)
	@UseGuards(AuthEventGuard)
	public async getFormAnswer(
		@EventCtx() eventContext: EventContext,
		@Parent() registrationDTO: EventRegistrationDTO
	): Promise<EventRegistrationFormAnswersDTO> {
		const event = await this.eventManager.getEventById(eventContext.getEventId());
		const registration = await this.registrationManager.getRegistrationById(
			eventContext, event, registrationDTO.id
		);
		const filledInForm = await this.formManager.getFilledInForm(eventContext, event, registration);

		return {
			answers: filledInForm.answers.map(answer => ({
				id: answer.id,
				answer: answer.answer as typeof EventRegistrationFormAnswerMetadataDTO
			}))
		};
	}
}