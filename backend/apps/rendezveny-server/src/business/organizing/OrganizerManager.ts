import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Event } from '../../data/models/Event';
import { Repository } from 'typeorm';
import {
	AuthContext,
	AuthEvent,
	AuthorizeGuard,
	IsOrganizer,
	IsRegistered
} from '../auth/AuthorizeGuard';
import { EventContext } from '../auth/tokens/EventToken';
import { Organizer } from '../../data/models/Organizer';
import { OrganizerDoesNotExistsException } from './exceptions/OrganizerDoesNotExistsException';

@Injectable()
export class OrganizerManager {
	public constructor(
		@InjectRepository(Organizer) private readonly organizerRepository: Repository<Organizer>,
	) {
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
}