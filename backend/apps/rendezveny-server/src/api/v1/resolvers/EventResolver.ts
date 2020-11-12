import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { EventDTO, PaginatedEventDTO } from '../dtos/EventDTO';
import { UseFilters, UseGuards } from '@nestjs/common';
import { BusinessExceptionFilter } from '../utils/BusinessExceptionFilter';
import { AccessCtx, AuthAccessGuard } from '../../../business/auth/passport/AuthAccessJwtStrategy';
import { AccessContext } from '../../../business/auth/tokens/AccessToken';
import { Offset, PageSize } from '../utils/PaginatedDTO';
import { EventManager } from '../../../business/events/EventManager';
import { UserManager } from '../../../business/users/UserManager';
import { GraphQLString } from 'graphql';
import { PaginatedEventRelationDTO } from '../dtos/EventRelationDTO';
import { EventContext } from '../../../business/auth/tokens/EventToken';
import { AuthEventGuard, EventCtx } from '../../../business/auth/passport/AuthEventJwtStrategy';
import { User } from '../../../data/models/User';
import { EventRelation } from '../../../business/events/EventRelation';

@Resolver((_: never) => EventDTO)
export class EventResolver {
	public constructor(
		private readonly userManager: UserManager,
		private readonly eventManager: EventManager
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

	/* User relations */

	@Query(_ => PaginatedEventRelationDTO, {
		name: 'events_getRegistered',
		description: 'Gets the list of registered users'
	})
	@UseFilters(BusinessExceptionFilter)
	@UseGuards(AuthEventGuard)
	public async getRegistered(
		@EventCtx() eventContext: EventContext,
		@Args('id', { description: 'The id of the event' }) id: string,
		@PageSize() pageSize: number,
		@Offset() offset: number,
		@Args('name', {
			description: 'The name to search for (empty if list all)',
			nullable: true
		}) name?: string
	): Promise<PaginatedEventRelationDTO> {
		const event = await this.eventManager.getEventById(id);
		const { relations, count } = await this.eventManager.getRelatedUsersPaginated(
			eventContext, event, pageSize, offset, {
				registered: true,
				name: name
			}
		);

		return this.returnEventRelationDTO(relations, count, pageSize, offset);
	}

	@Query(_ => PaginatedEventRelationDTO, {
		name: 'events_getAttended',
		description: 'Gets the list of users who attended the event'
	})
	@UseFilters(BusinessExceptionFilter)
	@UseGuards(AuthEventGuard)
	public async getAttended(
		@EventCtx() eventContext: EventContext,
		@Args('id', { description: 'The id of the event' }) id: string,
		@PageSize() pageSize: number,
		@Offset() offset: number,
		@Args('name', {
			description: 'The name to search for (empty if list all)',
			nullable: true
		}) name?: string
	): Promise<PaginatedEventRelationDTO> {
		const event = await this.eventManager.getEventById(id);
		const { relations, count } = await this.eventManager.getRelatedUsersPaginated(
			eventContext, event, pageSize, offset, {
				attended: true,
				name: name
			}
		);

		return this.returnEventRelationDTO(relations, count, pageSize, offset);
	}

	@Query(_ => PaginatedEventRelationDTO, {
		name: 'events_getDidNotAttend',
		description: 'Gets the list of users who registered but did not attend the event'
	})
	@UseFilters(BusinessExceptionFilter)
	@UseGuards(AuthEventGuard)
	public async getDidNotAttend(
		@EventCtx() eventContext: EventContext,
		@Args('id', { description: 'The id of the event' }) id: string,
		@PageSize() pageSize: number,
		@Offset() offset: number,
		@Args('name', {
			description: 'The name to search for (empty if list all)',
			nullable: true
		}) name?: string
	): Promise<PaginatedEventRelationDTO> {
		const event = await this.eventManager.getEventById(id);
		const { relations, count } = await this.eventManager.getRelatedUsersPaginated(
			eventContext, event, pageSize, offset, {
				attended: false,
				name: name
			}
		);

		return this.returnEventRelationDTO(relations, count, pageSize, offset);
	}

	@Query(_ => PaginatedEventRelationDTO, {
		name: 'events_getOrganizers',
		description: 'Gets the list of organizers for the event'
	})
	@UseFilters(BusinessExceptionFilter)
	@UseGuards(AuthEventGuard)
	public async getOrganizers(
		@EventCtx() eventContext: EventContext,
		@Args('id', { description: 'The id of the event' }) id: string,
		@PageSize() pageSize: number,
		@Offset() offset: number,
		@Args('name', {
			description: 'The name to search for (empty if list all)',
			nullable: true
		}) name?: string
	): Promise<PaginatedEventRelationDTO> {
		const event = await this.eventManager.getEventById(id);
		const { relations, count } = await this.eventManager.getRelatedUsersPaginated(
			eventContext, event, pageSize, offset, {
				organizer: true,
				name: name
			}
		);

		return this.returnEventRelationDTO(relations, count, pageSize, offset);
	}

	@Query(_ => PaginatedEventRelationDTO, {
		name: 'events_getChiefOrganizers',
		description: 'Gets the list of chief organizers for the event'
	})
	@UseFilters(BusinessExceptionFilter)
	@UseGuards(AuthEventGuard)
	public async getChiefOrganizers(
		@EventCtx() eventContext: EventContext,
		@Args('id', { description: 'The id of the event' }) id: string,
		@PageSize() pageSize: number,
		@Offset() offset: number,
		@Args('name', {
			description: 'The name to search for (empty if list all)',
			nullable: true
		}) name?: string
	): Promise<PaginatedEventRelationDTO> {
		const event = await this.eventManager.getEventById(id);
		const { relations, count } = await this.eventManager.getRelatedUsersPaginated(
			eventContext, event, pageSize, offset, {
				chiefOrganizer: true,
				name: name
			}
		);

		return this.returnEventRelationDTO(relations, count, pageSize, offset);
	}

	@Query(_ => PaginatedEventRelationDTO, {
		name: 'events_getUnregistered',
		description: 'Gets the list of users that are eligible to register for the event'
	})
	@UseFilters(BusinessExceptionFilter)
	@UseGuards(AuthEventGuard)
	public async getUnregistered(
		@EventCtx() eventContext: EventContext,
		@Args('id', { description: 'The id of the event' }) id: string,
		@PageSize() pageSize: number,
		@Offset() offset: number,
		@Args('name', {
			description: 'The name to search for (empty if list all)',
			nullable: true
		}) name?: string
	): Promise<PaginatedEventRelationDTO> {
		const event = await this.eventManager.getEventById(id);
		const { relations, count } = await this.eventManager.getRelatedUsersPaginated(
			eventContext, event, pageSize, offset, {
				registered: false,
				name: name
			}
		);

		return this.returnEventRelationDTO(relations, count, pageSize, offset);
	}

	@Query(_ => PaginatedEventRelationDTO, {
		name: 'events_getPotentialOrganizers',
		description: 'Gets the list of users that are eligible to organize the event'
	})
	@UseFilters(BusinessExceptionFilter)
	@UseGuards(AuthEventGuard)
	public async getPotentialOrganizers(
		@EventCtx() eventContext: EventContext,
		@Args('id', { description: 'The id of the event' }) id: string,
		@PageSize() pageSize: number,
		@Offset() offset: number,
		@Args('name', {
			description: 'The name to search for (empty if list all)',
			nullable: true
		}) name?: string
	): Promise<PaginatedEventRelationDTO> {
		const event = await this.eventManager.getEventById(id);
		const { relations, count } = await this.eventManager.getRelatedUsersPaginated(
			eventContext, event, pageSize, offset, {
				organizer: false,
				name: name
			}
		);

		return this.returnEventRelationDTO(relations, count, pageSize, offset);
	}

	private returnEventRelationDTO(relations: EventRelation[], count: number, pageSize: number, offset: number) {
		return {
			nodes: relations.map(relation => ({
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
						isChiefOrganizer: relation.isChiefOrganizer()
					}
					: undefined
			})),
			totalCount: count,
			pageSize: pageSize,
			offset: offset
		};
	}
}