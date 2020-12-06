import { Args, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { EventDTO, PaginatedEventDTO } from '../dtos/EventDTO';
import { UseFilters, UseGuards, UseInterceptors } from '@nestjs/common';
import { BusinessExceptionFilter } from '../utils/BusinessExceptionFilter';
import { AccessCtx, AuthAccessGuard } from '../../../business/auth/passport/AuthAccessJwtStrategy';
import { AccessContext } from '../../../business/auth/tokens/AccessToken';
import { Offset, PageSize } from '../utils/PaginatedDTO';
import { EventManager } from '../../../business/events/EventManager';
import { UserManager } from '../../../business/users/UserManager';
import { GraphQLBoolean, GraphQLString } from 'graphql';
import { EventRelationDTO, PaginatedEventRelationDTO } from '../dtos/EventRelationDTO';
import { EventContext } from '../../../business/auth/tokens/EventToken';
import { AuthEventGuard, EventCtx } from '../../../business/auth/passport/AuthEventJwtStrategy';
import { User } from '../../../data/models/User';
import { EventRelation } from '../../../business/events/EventRelation';
import { nameof } from '../../../utils/nameof';
import {
	EventRegistrationFormDTO,
	EventRegistrationFormInput,
	EventRegistrationFormQuestionMetadataDTO, PaginatedRegistrationFormTemplateQuestionDTO
} from '../dtos/EventRegistrationFormDTO';
import { FormManager } from '../../../business/registration/FormManager';
import { HRTableDTO, HRTableInput } from '../dtos/HRTableDTO';
import { HRTableManager } from '../../../business/organizing/HRTableManager';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { ClubManager } from '../../../business/clubs/ClubManager';
import { HRTableState } from '../../../business/organizing/HRTableState';
import { Event } from '../../../data/models/Event';
import { LoggingInterceptor } from '../../../business/log/LoggingInterceptor';
import { FormTemplateManager } from '../../../business/registration/FormTemplateManager';
import { EventLoginDTO } from '../dtos/EventLoginDTO';

@Resolver((_: never) => EventDTO)
@UseInterceptors(LoggingInterceptor)
export class EventResolver {
	public constructor(
		private readonly userManager: UserManager,
		private readonly clubManager: ClubManager,
		private readonly eventManager: EventManager,
		private readonly formManager: FormManager,
		private readonly formTemplateManager: FormTemplateManager,
		private readonly hrTableManager: HRTableManager
	) {}

	@Query(_ => PaginatedEventDTO, {
		name: 'events_getAll',
		description: 'Gets the events in the system'
	})
	@UseFilters(BusinessExceptionFilter)
	@UseGuards(AuthAccessGuard)
	public async getEvents(
		@AccessCtx() accessContext: AccessContext,
		@PageSize() pageSize: number,
		@Offset() offset: number,
		@Args('isRegisteredUpcoming', {
			description: 'The user is registered to and the event is upcoming', nullable: true
		}) isRegisteredUpcoming?: boolean,
		@Args('isRegisteredPast', {
			description: 'The user is registered to and the event is past', nullable: true
		}) isRegisteredPast?: boolean,
		@Args('isOrganizerUpcoming', {
			description: 'The user is organizer of and the event is upcoming', nullable: true
		}) isOrganizerUpcoming?: boolean,
		@Args('isOrganizerPast', {
			description: 'The user is organizer of and the event is past', nullable: true
		}) isOrganizerPast?: boolean,
		@Args('canRegisterToUpcoming', {
			description: 'The user can register to and the event is upcoming', nullable: true
		}) canRegisterToUpcoming?: boolean,
		@Args('canRegisterToPast', {
			description: 'The user can register to and the event is past', nullable: true
		}) canRegisterToPast?: boolean
	): Promise<PaginatedEventDTO> {
		const { events, count } = await this.eventManager.getAllEventsPaginated(
			accessContext, pageSize, offset, {
				isRegisteredUpcoming,
				isRegisteredPast,
				isOrganizerUpcoming,
				isOrganizerPast,
				canRegisterToUpcoming,
				canRegisterToPast
			}
		);

		return {
			nodes: events.map(event => EventResolver.eventToDTO(event)),
			totalCount: count,
			pageSize: pageSize,
			offset: offset
		};
	}

	@Query(_ => EventDTO, {
		name: 'events_getOne',
		description: 'Gets one event based on its id',
		nullable: true
	})
	@UseFilters(BusinessExceptionFilter)
	public async getEvent(
		@Args('id', { description: 'The id of the event', nullable: true }) id?: string,
		@Args('uniqueName', { description: 'The unique name of the event', nullable: true }) uniqueName?: string
	): Promise<EventDTO | null> {
		if(typeof id !== 'undefined') {
			return EventResolver.eventToDTO(await this.eventManager.getEventById(id));
		}
		else if(typeof uniqueName !== 'undefined') {
			return EventResolver.eventToDTO(await this.eventManager.getEventByUniqueName(uniqueName));
		}
		else {
			return null;
		}
	}

	@Query(_ => EventDTO, {
		name: 'events_getCurrent',
		description: 'Gets the current event'
	})
	@UseFilters(BusinessExceptionFilter)
	@UseGuards(AuthEventGuard)
	public async getCurrent(
		@EventCtx() eventContext: EventContext
	): Promise<EventDTO> {
		return EventResolver.eventToDTO(await this.eventManager.getEventById(eventContext.getEventId()));
	}

	@Mutation(_ => EventDTO, {
		name: 'events_addEvent',
		description: 'Adds an event'
	})
	@UseFilters(BusinessExceptionFilter)
	@UseGuards(AuthAccessGuard)
	@Transactional()
	public async addEvent(
		@AccessCtx() accessContext: AccessContext,
		@Args('name', { description: 'The name of the event' }) name: string,
		@Args('uniqueName', { description: 'The unique name of the event' }) uniqueName: string,
		@Args('description', { description: 'The description of the event' }) description: string,
		@Args('isClosedEvent', { description: 'Indicates whether the event is closed' }) isClosedEvent: boolean,
		@Args('hostingClubIds', {
			description: 'The ids of the hosting clubs',
			type: () => [GraphQLString]
		}) hostingClubIds: string[],
		@Args('chiefOrganizerIds', {
			description: 'The ids of the chief organizers',
			type: () => [GraphQLString]
		}) chiefOrganizerIds: string[],
		@Args('start', {
			description: 'The start date of the event',
			nullable: true
		}) start?: Date,
		@Args('end', {
			description: 'The end date of the event',
			nullable: true
		}) end?: Date,
		@Args('registrationStart', {
			description: 'Indicates start of the registration for the event',
			nullable: true
		}) registrationStart?: Date,
		@Args('registrationEnd', {
			description: 'Indicates end of the registration for the event',
			nullable: true
		}) registrationEnd?: Date,
		@Args('registrationAllowed', {
			description: 'Indicates end of the registration for the event is allowed',
			nullable: true
		}) registrationAllowed?: boolean,
		@Args('dateOrTime', {
			description: 'Indicates whether the dates contain times as well',
			nullable: true
		}) isDateOrTime?: boolean,
		@Args('place', {
			description: 'The place of the event',
			nullable: true
		}) place?: string,
		@Args('capacity', {
			description: 'The capacity of the event',
			nullable: true
		}) capacity?: number
	): Promise<EventDTO> {
		return EventResolver.eventToDTO(await this.eventManager.addEvent(
			accessContext,
			name,
			uniqueName,
			description,
			isClosedEvent,
			await Promise.all(hostingClubIds.map(async id => this.clubManager.getClubById(accessContext, id))),
			await Promise.all(chiefOrganizerIds.map(async id => this.userManager.getUserById(accessContext, id))),
			{
				start, end, registrationEnd, registrationStart, registrationAllowed, isDateOrTime, place, capacity
			}
		));
	}

	@Mutation(_ => EventDTO, {
		name: 'events_modifyEvent',
		description: 'Modifies an event'
	})
	@UseFilters(BusinessExceptionFilter)
	@UseGuards(AuthEventGuard)
	@Transactional()
	public async modifyEvent(
		@EventCtx() eventContext: EventContext,
		@Args('id', {
			description: 'The id of the event'
		}) id: string,
		@Args('name', {
			description: 'The name of the event',
			nullable: true
		}) name: string,
		@Args('uniqueName', {
			description: 'The unique name of the event',
			nullable: true
		}) uniqueName: string,
		@Args('description', {
			description: 'The description of the event',
			nullable: true
		}) description: string,
		@Args('isClosedEvent', {
			description: 'Indicates whether the event is closed',
			nullable: true
		}) isClosedEvent: boolean,
		@Args('hostingClubIds', {
			description: 'The ids of the hosting clubs',
			type: () => [GraphQLString],
			nullable: true
		}) hostingClubIds: string[],
		@Args('chiefOrganizerIds', {
			description: 'The ids of the chief organizers',
			type: () => [GraphQLString],
			nullable: true
		}) chiefOrganizerIds: string[],
		@Args('organizerIds', {
			description: 'The ids of the not chief organizers',
			type: () => [GraphQLString],
			nullable: true
		}) organizerIds: string[],
		@Args('start', {
			description: 'The start date of the event',
			nullable: true
		}) start?: Date,
		@Args('end', {
			description: 'The end date of the event',
			nullable: true
		}) end?: Date,
		@Args('registrationStart', {
			description: 'Indicates start of the registration for the event',
			nullable: true
		}) registrationStart?: Date,
		@Args('registrationEnd', {
			description: 'Indicates end of the registration for the event',
			nullable: true
		}) registrationEnd?: Date,
		@Args('registrationAllowed', {
			description: 'Indicates end of the registration for the event is allowed',
			nullable: true
		}) registrationAllowed?: boolean,
		@Args('dateOrTime', {
			description: 'Indicates whether the dates contain times as well',
			nullable: true
		}) isDateOrTime?: boolean,
		@Args('place', {
			description: 'The place of the event',
			nullable: true
		}) place?: string,
		@Args('capacity', {
			description: 'The capacity of the event',
			nullable: true
		}) capacity?: number
	): Promise<EventDTO> {
		const event = await this.eventManager.getEventById(id);
		return EventResolver.eventToDTO(await this.eventManager.editEvent(
			eventContext,
			event,
			{
				name,
				uniqueName,
				description,
				isClosedEvent,
				hostingClubIds,
				chiefOrganizerIds,
				organizerIds,
				start,
				end,
				registrationEnd,
				registrationStart,
				registrationAllowed,
				isDateOrTime,
				place,
				capacity
			}
		));
	}

	@Mutation(_ => GraphQLBoolean, {
		name: 'events_deleteEvent',
		description: 'Deletes an event'
	})
	@UseFilters(BusinessExceptionFilter)
	@UseGuards(AuthEventGuard)
	@Transactional()
	public async deleteEvent(
		@EventCtx() eventContext: EventContext,
		@Args('id', { description: 'The id of the event' }) id: string
	): Promise<boolean> {
		const event = await this.eventManager.getEventById(id);
		await this.eventManager.deleteEvent(eventContext, event);
		return true;
	}

	@Mutation(_ => EventLoginDTO, {
		name: 'events_getToken',
		description: 'Gets one event based on its id'
	})
	@UseFilters(BusinessExceptionFilter)
	@UseGuards(AuthAccessGuard)
	public async getEventToken(
		@AccessCtx() accessContext: AccessContext,
		@Args('id', { description: 'The id of the event', nullable: true }) id?: string,
		@Args('uniqueName', { description: 'The unique name of the event', nullable: true }) uniqueName?: string
	): Promise<EventLoginDTO | null> {
		let event = null;
		if(typeof id !== 'undefined') {
			event = await this.eventManager.getEventById(id)
		}
		if(typeof uniqueName !== 'undefined') {
			event = await this.eventManager.getEventByUniqueName(uniqueName) 
		}
		if(!event) {
			return null;
		}
		const { token, relation } = await this.eventManager.getEventToken(accessContext, event);

		return {
			eventToken: token,
			id: event.id,
			relation: this.returnEventRelationDTO(relation)
		};
	}

	@ResolveField(nameof<EventDTO>('relations'), _ => PaginatedEventRelationDTO)
	@UseFilters(BusinessExceptionFilter)
	@UseGuards(AuthEventGuard)
	public async getRelations(
		@EventCtx() eventContext: EventContext,
		@Parent() eventDTO: EventDTO,
		@PageSize() pageSize: number,
		@Offset() offset: number,
		@Args('registered', {
			description: 'Indicates whether only registered or not registered users should be shown',
			nullable: true
		}) registered?: boolean,
		@Args('attended', {
			description: 'Indicates whether only attended or not registered but not attended users should be shown',
			nullable: true
		}) attended?: boolean,
		@Args('organizer', {
			description: 'Indicates whether only organizers or potential organizers should be shown',
			nullable: true
		}) organizer?: boolean,
		@Args('chiefOrganizer', {
			description: 'Indicates whether only chief organizers or potential chief organizers should be shown',
			nullable: true
		}) chiefOrganizer?: boolean,
		@Args('name', {
			description: 'The name to search for (empty if list all)',
			nullable: true
		}) name?: string
	): Promise<PaginatedEventRelationDTO> {
		const event = await this.eventManager.getEventById(eventDTO.id);
		const { relations, count } = await this.eventManager.getRelatedUsersPaginated(
			eventContext, event, pageSize, offset, {
				registered, attended, organizer, chiefOrganizer, name
			}
		);

		return {
			nodes: relations.map(relation => this.returnEventRelationDTO(relation)),
			totalCount: count,
			pageSize: pageSize,
			offset: offset
		};
	}

	@ResolveField(nameof<EventDTO>('selfRelation'), _ => EventRelationDTO)
	@UseFilters(BusinessExceptionFilter)
	@UseGuards(AuthEventGuard)
	public async getSelfRelation(
		@EventCtx() eventContext: EventContext,
		@Parent() eventDTO: EventDTO
	): Promise<EventRelationDTO> {
		const event = await this.eventManager.getEventById(eventDTO.id);
		const eventRelation = await this.eventManager.getSelfRelation(eventContext, event);
		return this.returnEventRelationDTO(eventRelation);
	}

	@ResolveField(nameof<EventDTO>('selfRelation2'), _ => EventRelationDTO)
	@UseFilters(BusinessExceptionFilter)
	@UseGuards(AuthAccessGuard)
	public async getSelfRelation2(
		@AccessCtx() accessContext: AccessContext,
		@Parent() eventDTO: EventDTO
	): Promise<EventRelationDTO> {
		const event = await this.eventManager.getEventById(eventDTO.id);
		const eventRelation = await this.eventManager.getSelfRelation2(accessContext, event);
		return this.returnEventRelationDTO(eventRelation);
	}

	@Query(_ => PaginatedRegistrationFormTemplateQuestionDTO, {
		name: 'events_getRegistrationFormTemplates',
		description: 'Gets the registration form templates'
	})
	@UseFilters(BusinessExceptionFilter)
	@UseGuards(AuthAccessGuard)
	public async getRegistrationFormTemplates(
		@AccessCtx() accessContext: AccessContext,
		@PageSize() pageSize: number,
		@Offset() offset: number,
	): Promise<PaginatedRegistrationFormTemplateQuestionDTO> {
		const { templates, count } = await this.formTemplateManager.getAllTemplatesPaginated(
			accessContext, pageSize, offset
		);

		return {
			nodes: templates.map(template => ({
				id: template.id,
				question: template.question,
				metadata: template.typeMetadata as typeof EventRegistrationFormQuestionMetadataDTO
			})),
			totalCount: count,
			pageSize: pageSize,
			offset: offset
		};
	}

	@ResolveField(nameof<EventDTO>('registrationForm'), _ => EventRegistrationFormDTO)
	@UseFilters(BusinessExceptionFilter)
	public async getRegistrationForm(
		@Parent() eventDTO: EventDTO
	): Promise<EventRegistrationFormDTO> {
		const event = await this.eventManager.getEventById(eventDTO.id);
		const form = await this.formManager.getForm(event);
		return {
			questions: form.questions.map(question => ({
				id: question.id,
				isRequired: question.isRequired,
				question: question.question,
				metadata: question.data as typeof EventRegistrationFormQuestionMetadataDTO
			}))
		};
	}

	@Mutation(_ => EventRegistrationFormDTO, {
		name: 'events_modifyRegistrationForm',
		description: 'Modifies the registration form'
	})
	@UseFilters(BusinessExceptionFilter)
	@UseGuards(AuthEventGuard)
	@Transactional()
	public async setRegistrationForm(
		@EventCtx() eventContext: EventContext,
		@Args('id', { description: 'The id of the event' }) id: string,
		@Args('form', {
			description: 'The modified form',
			type: () => EventRegistrationFormInput
		}) form: EventRegistrationFormInput
	): Promise<EventRegistrationFormDTO> {
		const event = await this.eventManager.getEventById(id);
		const newForm = await this.formManager.modifyForm(eventContext, event, {
			questions: form.questions.map(question => ({
				id: question.id,
				question: question.question,
				isRequired: question.isRequired,
				data: JSON.parse(question.metadata)
			}))
		});

		return {
			questions: newForm.questions.map(question => ({
				id: question.id,
				isRequired: question.isRequired,
				question: question.question,
				metadata: question.data as typeof EventRegistrationFormQuestionMetadataDTO
			}))
		};
	}

	@ResolveField(nameof<EventDTO>('hrTable'), _ => HRTableDTO, {
		nullable: true
	})
	@UseFilters(BusinessExceptionFilter)
	@UseGuards(AuthEventGuard)
	public async getHRTable(
		@EventCtx() eventContext: EventContext,
		@Parent() eventDTO: EventDTO
	): Promise<HRTableDTO | undefined> {
		const event = await this.eventManager.getEventById(eventDTO.id);
		const hrTableState = await this.hrTableManager.getHRTable(eventContext, event);

		if(hrTableState) {
			return this.returnHrTableState(eventContext, event, hrTableState);
		}
		else {
			return undefined;
		}
	}

	@Mutation(_ => HRTableDTO, {
		name: 'events_createHRTable',
		description: 'Creates the HR table'
	})
	@UseFilters(BusinessExceptionFilter)
	@UseGuards(AuthEventGuard)
	@Transactional()
	public async createHRTable(
		@EventCtx() eventContext: EventContext,
		@Args('id', { description: 'The id of the event' }) id: string
	): Promise<HRTableDTO> {
		const event = await this.eventManager.getEventById(id);
		await this.hrTableManager.createHRTable(eventContext, event, { isLocked: false, tasks: [] });
		const hrTableState = await this.hrTableManager.getHRTable(eventContext, event);
		return this.returnHrTableState(eventContext, event, hrTableState!);
	}

	@Mutation(_ => HRTableDTO, {
		name: 'events_modifyHRTable',
		description: 'Modifies the HR table'
	})
	@UseFilters(BusinessExceptionFilter)
	@UseGuards(AuthEventGuard)
	@Transactional()
	public async setHRTable(
		@EventCtx() eventContext: EventContext,
		@Args('id', { description: 'The id of the event' }) id: string,
		@Args('hrTable', {
			description: 'The modified HRTable',
			type: () => HRTableInput
		}) hrTable: HRTableInput
	): Promise<HRTableDTO> {
		const event = await this.eventManager.getEventById(id);
		await this.hrTableManager.modifyHRTable(eventContext, event, hrTable);
		const hrTableState = await this.hrTableManager.getHRTable(eventContext, event);
		return this.returnHrTableState(eventContext, event, hrTableState!);
	}

	@Mutation(_ => GraphQLBoolean, {
		name: 'events_deleteHRTable',
		description: 'Deletes the HR table'
	})
	@UseFilters(BusinessExceptionFilter)
	@UseGuards(AuthEventGuard)
	@Transactional()
	public async deleteHRTable(
		@EventCtx() eventContext: EventContext,
		@Args('id', { description: 'The id of the event' }) id: string
	): Promise<boolean> {
		const event = await this.eventManager.getEventById(id);
		await this.hrTableManager.deleteHRTable(eventContext, event);
		return true;
	}

	private returnEventRelationDTO(relation: EventRelation): EventRelationDTO {
		return {
			name: relation.user.name ?? '',
			email: relation.user.name ?? '',
			// eslint-disable-next-line no-undefined
			userId: relation.user instanceof User ? relation.user.id : undefined,
			isMemberOfHostingClub: relation.isHostingClubMember(),
			isRegistered: relation.isRegistered(),
			isOrganizer: relation.isOrganizer(),
			isChiefOrganizer: relation.isChiefOrganizer(),
			registration: relation.isRegistered()
			? {
				id: relation.getRegistration().id,
				didAttend: relation.didAttend()
			}
			: undefined,
			organizer: relation.isOrganizer()
			? {
				id: relation.getOrganizerId(),
				isChiefOrganizer: relation.isChiefOrganizer()
			}
			: undefined
		};
	}

	private async returnHrTableState(
		eventContext: EventContext, event: Event, hrTableState: HRTableState
	): Promise<HRTableDTO> {
		return {
			...hrTableState,
			tasks: await Promise.all(hrTableState.tasks.map(async task => ({
				...task,
				segments: await Promise.all(task.segments.map(async segment => ({
					...segment,
					organizers: (await this.eventManager.getUserRelation(
						eventContext, event, segment.organizers.map(o => o.user)
					)).map(r => this.returnEventRelationDTO(r))
				})))
			})))
		};
	}

	private static eventToDTO(event: Event): EventDTO {
		return {
			id: event.id,
			name: event.name,
			uniqueName: event.uniqueName,
			description: event.description,
			// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
			hostingClubs: event.hostingClubs ?? [],
			place: event.place ?? undefined,
			capacity: event.capacity ?? undefined,
			isClosedEvent: event.isClosedEvent,
			start: event.start ?? undefined,
			end: event.end ?? undefined,
			isDateOrTime: event.isDateOrTime,
			registrationStart: event.registrationStart ?? undefined,
			registrationEnd: event.registrationEnd ?? undefined,
			registrationAllowed: event.registrationAllowed ?? undefined
		};
	}
}