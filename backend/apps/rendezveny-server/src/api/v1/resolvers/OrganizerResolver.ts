import { Args, Mutation, Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { UseFilters, UseGuards, UseInterceptors } from '@nestjs/common';
import { BusinessExceptionFilter } from '../utils/BusinessExceptionFilter';
import { EventManager } from '../../../business/events/EventManager';
import { EventContext } from '../../../business/auth/tokens/EventToken';
import { AuthEventGuard, EventCtx } from '../../../business/auth/passport/AuthEventJwtStrategy';
import { nameof } from '../../../utils/nameof';
import { EventOrganizerDTO } from '../dtos/EventOrganizerDTO';
import { GraphQLBoolean, GraphQLString } from 'graphql';
import { OrganizerManager } from '../../../business/organizing/OrganizerManager';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { LoggingInterceptor } from '../../../business/log/LoggingInterceptor';

@Resolver((_: never) => EventOrganizerDTO)
@UseInterceptors(LoggingInterceptor)
export class OrganizerResolver {
	public constructor(
		private readonly eventManager: EventManager,
		private readonly organizerManager: OrganizerManager
	) {}

	@Mutation(_ => EventOrganizerDTO, {
		name: 'organizer_addOrganizer',
		description: 'Adds an organizer for the event'
	})
	@UseFilters(BusinessExceptionFilter)
	@UseGuards(AuthEventGuard)
	@Transactional()
	public async addOrganizer(
		@EventCtx() eventContext: EventContext,
		@Args('id', { description: 'The id of the registration' }) id: string,
		@Args('userId', { description: 'The id of the user' }) userId: string,
		@Args('isChief', { description: 'Indicates whether the user should be chief' }) isChief: boolean,
	): Promise<EventOrganizerDTO> {
		const event = await this.eventManager.getEventById(id);
		const organizer = await this.organizerManager.addOrganizer(eventContext, event, userId, isChief);
		return {
			id: organizer.id,
			isChiefOrganizer: organizer.isChief
		};
	}

	@Mutation(_ => EventOrganizerDTO, {
		name: 'organizer_modifyOrganizer',
		description: 'Modifies an organizer'
	})
	@UseFilters(BusinessExceptionFilter)
	@UseGuards(AuthEventGuard)
	@Transactional()
	public async modifyOrganizer(
		@EventCtx() eventContext: EventContext,
		@Args('id', { description: 'The id of organizer' }) id: string,
		@Args('isChief', { description: 'Indicates whether the user should be chief' }) isChief: boolean,
	): Promise<EventOrganizerDTO> {
		const event = await this.eventManager.getEventById(eventContext.getEventId());
		const organizer = await this.organizerManager.getOrganizerById(eventContext, event, id);
		const modifiedOrganizer = await this.organizerManager.makeChiefOrganizer(
			eventContext, event, organizer, isChief
		);

		return {
			id: modifiedOrganizer.id,
			isChiefOrganizer: modifiedOrganizer.isChief
		};
	}

	@Mutation(_ => GraphQLBoolean, {
		name: 'organizer_deleteOrganizer',
		description: 'Deletes an organizer'
	})
	@UseFilters(BusinessExceptionFilter)
	@UseGuards(AuthEventGuard)
	@Transactional()
	public async deleteOrganizer(
		@EventCtx() eventContext: EventContext,
		@Args('id', { description: 'The id of organizer' }) id: string,
	): Promise<boolean> {
		const event = await this.eventManager.getEventById(eventContext.getEventId());
		const organizer = await this.organizerManager.getOrganizerById(eventContext, event, id);
		await this.organizerManager.removeOrganizer(eventContext, event, organizer);

		return true;
	}

	@ResolveField(nameof<EventOrganizerDTO>('hrSegmentIds'), _ => [GraphQLString])
	@UseFilters(BusinessExceptionFilter)
	@UseGuards(AuthEventGuard)
	public async getFormAnswer(
		@EventCtx() eventContext: EventContext,
		@Parent() organizerDTO: EventOrganizerDTO
	): Promise<string[]> {
		if(typeof organizerDTO.id === 'string') {
			const event = await this.eventManager.getEventById(eventContext.getEventId());
			const organizer = await this.organizerManager.getOrganizerById(eventContext, event, organizerDTO.id);
			const hrSegments = await this.organizerManager.getHrSegments(eventContext, event, organizer);
			return hrSegments.map(segment => segment.id);
		}
		else {
			return [];
		}
	}

	@Mutation(_ => GraphQLBoolean, {
		name: 'organizer_registerToHRTask',
		description: 'Registers the organizer for a HR task'
	})
	@UseFilters(BusinessExceptionFilter)
	@UseGuards(AuthEventGuard)
	@Transactional()
	public async registerToHRTask(
		@EventCtx() eventContext: EventContext,
		@Args('id', { description: 'The id of organizer' }) id: string,
		@Args('hrSegmentId', { description: 'The id of the segment to register to' }) hrSegmentId: string,
	): Promise<boolean> {
		const event = await this.eventManager.getEventById(eventContext.getEventId());
		const organizer = await this.organizerManager.getOrganizerById(eventContext, event, id);
		await this.organizerManager.registerOrganizerToHRTask(eventContext, event, organizer, hrSegmentId);

		return true;
	}

	@Mutation(_ => GraphQLBoolean, {
		name: 'organizer_unregisterFromHRTask',
		description: 'Unregisters an organizer from a HR task'
	})
	@UseFilters(BusinessExceptionFilter)
	@UseGuards(AuthEventGuard)
	@Transactional()
	public async unregisterFromHRTask(
		@EventCtx() eventContext: EventContext,
		@Args('id', { description: 'The id of organizer' }) id: string,
		@Args('hrSegmentId', { description: 'The id of the segment to register to' }) hrSegmentId: string,
	): Promise<boolean> {
		const event = await this.eventManager.getEventById(eventContext.getEventId());
		const organizer = await this.organizerManager.getOrganizerById(eventContext, event, id);
		await this.organizerManager.unregisterOrganizerFromHRTask(eventContext, event, organizer, hrSegmentId);

		return true;
	}
}