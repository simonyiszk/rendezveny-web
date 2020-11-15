import { Args, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { EventDTO, PaginatedEventDTO } from '../dtos/EventDTO';
import { UseFilters, UseGuards } from '@nestjs/common';
import { BusinessExceptionFilter } from '../utils/BusinessExceptionFilter';
import { AccessCtx, AuthAccessGuard } from '../../../business/auth/passport/AuthAccessJwtStrategy';
import { AccessContext } from '../../../business/auth/tokens/AccessToken';
import { Offset, PageSize } from '../utils/PaginatedDTO';
import { EventManager } from '../../../business/events/EventManager';
import { UserManager } from '../../../business/users/UserManager';
import { GraphQLString } from 'graphql';
import { EventRelationDTO, PaginatedEventRelationDTO } from '../dtos/EventRelationDTO';
import { EventContext } from '../../../business/auth/tokens/EventToken';
import { AuthEventGuard, EventCtx } from '../../../business/auth/passport/AuthEventJwtStrategy';
import { User } from '../../../data/models/User';
import { EventRelation } from '../../../business/events/EventRelation';
import { nameof } from '../../../utils/nameof';
import { EventRegistrationFormDTO, EventRegistrationFormQuestionMetadataDTO } from '../dtos/EventRegistrationFormDTO';
import { FormManager } from '../../../business/registration/FormManager';
import { HRTableDTO } from '../dtos/HRTableDTO';
import { HRTableManager } from '../../../business/organizing/HRTableManager';

@Resolver((_: never) => EventDTO)
export class EventResolver {
	public constructor(
		private readonly userManager: UserManager,
		private readonly eventManager: EventManager,
		private readonly formManager: FormManager,
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
		@Offset() offset: number
	): Promise<PaginatedEventDTO> {
		const { events, count } = await this.eventManager.getAllEventsPaginated(accessContext, pageSize, offset);

		return {
			nodes: events,
			totalCount: count,
			pageSize: pageSize,
			offset: offset
		};
	}

	@Query(_ => EventDTO, {
		name: 'events_getOne',
		description: 'Gets one event based on its id'
	})
	@UseFilters(BusinessExceptionFilter)
	public async getEvent(
		@Args('id', { description: 'The id of the event' }) id: string
	): Promise<EventDTO> {
		return this.eventManager.getEventById(id);
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
		return this.eventManager.getEventById(eventContext.getEventId());
	}

	@Mutation(_ => GraphQLString, {
		name: 'events_getToken',
		description: 'Gets one event based on its id'
	})
	@UseFilters(BusinessExceptionFilter)
	@UseGuards(AuthAccessGuard)
	public async getEventToken(
		@AccessCtx() accessContext: AccessContext,
		@Args('id', { description: 'The id of the event' }) id: string
	): Promise<string> {
		const event = await this.eventManager.getEventById(id);
		return this.eventManager.getEventToken(accessContext, event);
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

	@ResolveField(nameof<EventDTO>('hrTable'), _ => HRTableDTO)
	@UseFilters(BusinessExceptionFilter)
	@UseGuards(AuthEventGuard)
	public async getHRTable(
		@EventCtx() eventContext: EventContext,
		@Parent() eventDTO: EventDTO
	): Promise<HRTableDTO> {
		const event = await this.eventManager.getEventById(eventDTO.id);
		const hrTableState = await this.hrTableManager.getHRTable(eventContext, event);
		return {
			...hrTableState,
			tasks: hrTableState.tasks.map(task => ({
				...task,
				segments: task.segments.map(segment => ({
					...segment,
					organizers: segment.organizers.map(organizer => ({
						id: organizer.id,
						isChiefOrganizer: organizer.isChief
					}))
				}))
			}))
		};
	}

	private returnEventRelationDTO(relation: EventRelation) {
		return {
			name: relation.user.name,
				email: relation.user.name,
			// eslint-disable-next-line no-undefined
			userId: relation.user instanceof User ? relation.user.id : undefined,
			isMemberOfHostingClub: relation.isHostingClubMember(),
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
}