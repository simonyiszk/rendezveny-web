import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { PaginatedEventDTO } from '../dtos/EventDTO';
import { UseFilters, UseGuards } from '@nestjs/common';
import { BusinessExceptionFilter } from '../utils/BusinessExceptionFilter';
import { EventManager } from '../../../business/events/EventManager';
import { UserManager } from '../../../business/users/UserManager';
import { EventContext } from '../../../business/auth/tokens/EventToken';
import { AuthEventGuard, EventCtx } from '../../../business/auth/passport/AuthEventJwtStrategy';
import { nameof } from '../../../utils/nameof';
import { FormManager } from '../../../business/events/FormManager';
import { EventRegistrationDTO } from '../dtos/EventRegistrationDTO';
import {
	EventRegistrationFormAnswerMetadataDTO,
	EventRegistrationFormAnswersDTO
} from '../dtos/EventRegistrationFormAnswerDTO';
import { RegistrationManager } from '../../../business/events/RegistrationManager';

@Resolver((_: never) => EventRegistrationDTO)
export class RegistrationResolver {
	public constructor(
		private readonly userManager: UserManager,
		private readonly eventManager: EventManager,
		private readonly registrationManager: RegistrationManager,
		private readonly formManager: FormManager
	) {}

	@Query(_ => PaginatedEventDTO, {
		name: 'registration_getOne',
		description: 'Gets one registration by its id'
	})
	@UseFilters(BusinessExceptionFilter)
	@UseGuards(AuthEventGuard)
	public async getFormAnswers(
		@EventCtx() eventContext: EventContext,
		@Args('id', { description: 'The id of the registration' }) id: string,
	): Promise<EventRegistrationDTO> {
		const event = await this.eventManager.getEventById(eventContext.getEventId());
		const registration = await this.registrationManager.getRegistrationById(eventContext, event, id);
		return {
			id: registration.id,
			didAttend: typeof registration.attendDate === 'object'
		};
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