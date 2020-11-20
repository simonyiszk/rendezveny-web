import { InjectRepository } from '@nestjs/typeorm';
import { Event } from '../../data/models/Event';
import {
	AuthContext,
	AuthEvent,
	AuthorizeGuard,
	IsChiefOrganizer,
	IsOrganizer,
	IsRegistered
} from '../auth/AuthorizeGuard';
import { EventContext } from '../auth/tokens/EventToken';
import { Organizer } from '../../data/models/Organizer';
import { OrganizerDoesNotExistsException } from './exceptions/OrganizerDoesNotExistsException';
import { HRSegment } from '../../data/models/HRSegment';
import { UserDoesNotExistsException } from '../users/exceptions/UserDoesNotExistsException';
import { OrganizerAlreadyIsAnOrganizerException } from './exceptions/OrganizerAlreadyIsAnOrganizerException';
import { DEFAULT } from '../../data/models/OrganizerNotificationSettings';
import { OrganizerRepository, UserRepository } from '../../data/repositories/repositories';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { BaseManager, Manager } from '../utils/BaseManager';

@Manager()
export class OrganizerManager extends BaseManager {
	public constructor(
		@InjectRepository(OrganizerRepository) private readonly organizerRepository: OrganizerRepository,
		@InjectRepository(UserRepository) private readonly userRepository: UserRepository,
	) {
		super();
	}

	@AuthorizeGuard(IsRegistered(), IsOrganizer())
	public async getOrganizerById(
		@AuthContext() eventContext: EventContext,
		@AuthEvent() event: Event,
		id: string
	): Promise<Organizer> {
		const organizer = await this.organizerRepository.findOne({ id, event }, {});

		if(!organizer) {
			return this.getOrganizerFail(id);
		}
		else {
			return this.getOrganizer(eventContext, event, organizer);
		}
	}

	@AuthorizeGuard(IsRegistered(), IsOrganizer())
	public async getOrganizer(
		@AuthContext() _eventContext: EventContext,
		@AuthEvent() _event: Event,
		organizer: Organizer
	): Promise<Organizer> {
		return organizer;
	}

	private async getOrganizerFail(
		id: string
	): Promise<Organizer> {
		throw new OrganizerDoesNotExistsException(id);
	}

	@AuthorizeGuard(IsOrganizer())
	public async getHrSegments(
		@AuthContext() _eventContext: EventContext,
		@AuthEvent() _event: Event,
		organizer: Organizer
	): Promise<HRSegment[]> {
		await organizer.loadRelation(this.organizerRepository, 'hrSegments');
		return organizer.hrSegments;
	}

	@Transactional()
	@AuthorizeGuard(IsChiefOrganizer())
	public async addOrganizer(
		@AuthContext() _eventContext: EventContext,
		@AuthEvent() event: Event,
		userId: string,
		isChief: boolean
	): Promise<Organizer> {
		const user = await this.userRepository.findOne({ id: userId });
		if(!user) {
			throw new UserDoesNotExistsException(userId);
		}

		const organizer = await this.organizerRepository.findOne({ event, user });
		if(organizer) {
			throw new OrganizerAlreadyIsAnOrganizerException();
		}

		const newOrganizer = new Organizer({
			event: event,
			user: user,
			isChief: isChief,
			notificationSettings: DEFAULT
		});
		await this.organizerRepository.save(newOrganizer);

		return newOrganizer;
	}

	@Transactional()
	@AuthorizeGuard(IsChiefOrganizer())
	public async makeChiefOrganizer(
		@AuthContext() _eventContext: EventContext,
		@AuthEvent() event: Event,
		organizer: Organizer,
		isChief: boolean
	): Promise<Organizer> {
		organizer.isChief = isChief;
		await this.organizerRepository.save(organizer);
		return organizer;
	}

	@Transactional()
	@AuthorizeGuard(IsChiefOrganizer())
	public async removeOrganizer(
		@AuthContext() _eventContext: EventContext,
		@AuthEvent() event: Event,
		organizer: Organizer
	): Promise<void> {
		await this.organizerRepository.remove(organizer);
	}
}