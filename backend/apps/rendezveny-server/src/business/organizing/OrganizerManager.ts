/* eslint-disable max-len */
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
import { HRSegmentRepository, OrganizerRepository, UserRepository } from '../../data/repositories/repositories';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { BaseManager, Manager } from '../utils/BaseManager';
import { HRSegmentDoesNotExistsException } from './exceptions/HRSegmentDoesNotExistsException';
import { nameof } from '../../utils/nameof';
import { HRSegmentOrganizerAlreadyRegisteredException } from './exceptions/HRSegmentOrganizerAlreadyRegisteredException';
import { HRSegmentIsFullException } from './exceptions/HRSegmentIsFullException';
import { checkPermission } from '../utils/permissions/CheckPermissions';
/* eslint-enable max-len */

@Manager()
export class OrganizerManager extends BaseManager {
	public constructor(
		@InjectRepository(OrganizerRepository) private readonly organizerRepository: OrganizerRepository,
		@InjectRepository(HRSegmentRepository) private readonly hrSegmentRepository: HRSegmentRepository,
		@InjectRepository(UserRepository) private readonly userRepository: UserRepository
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

		if (!organizer) {
			return this.getOrganizerFail(id);
		} else {
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

	private async getOrganizerFail(id: string): Promise<Organizer> {
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
		if (!user) {
			throw new UserDoesNotExistsException(userId);
		}

		const organizer = await this.organizerRepository.findOne({ event, user });
		if (organizer) {
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

	@Transactional()
	@AuthorizeGuard(IsOrganizer())
	public async registerOrganizerToHRTask(
		@AuthContext() eventContext: EventContext,
		@AuthEvent() event: Event,
		organizer: Organizer,
		hrSegmentId: string
	): Promise<void> {
		checkPermission(eventContext.isChiefOrganizer(event) || eventContext.getUserId() === organizer.userId);

		const hrSegment = await this.hrSegmentRepository.findOne(hrSegmentId, {
			relations: [nameof<HRSegment>('organizers')]
		});
		if (!hrSegment) {
			throw new HRSegmentDoesNotExistsException();
		}

		if (hrSegment.organizers.some((o) => o.id === organizer.id)) {
			throw new HRSegmentOrganizerAlreadyRegisteredException();
		}

		if (hrSegment.capacity <= hrSegment.organizers.length) {
			throw new HRSegmentIsFullException();
		}

		hrSegment.organizers.push(organizer);
		await this.hrSegmentRepository.save(hrSegment);
	}

	@Transactional()
	@AuthorizeGuard(IsOrganizer())
	public async unregisterOrganizerFromHRTask(
		@AuthContext() eventContext: EventContext,
		@AuthEvent() event: Event,
		organizer: Organizer,
		hrSegmentId: string
	): Promise<void> {
		checkPermission(eventContext.isChiefOrganizer(event) || eventContext.getUserId() === organizer.userId);

		await organizer.loadRelation(this.organizerRepository, 'hrSegments');

		const hrSegment = await this.hrSegmentRepository.findOne(hrSegmentId, {
			relations: [nameof<HRSegment>('organizers')]
		});
		if (!hrSegment) {
			throw new HRSegmentDoesNotExistsException();
		}

		hrSegment.organizers = hrSegment.organizers.filter((o) => o.id !== organizer.id);
		organizer.hrSegments = organizer.hrSegments.filter((s) => s.id !== hrSegmentId);

		await this.hrSegmentRepository.save(hrSegment);
		await this.organizerRepository.save(organizer);
	}
}
