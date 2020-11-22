/* eslint-disable max-len */
import { InjectRepository } from '@nestjs/typeorm';
import { In, Like, Not } from 'typeorm';
import { Event } from '../../data/models/Event';
import { checkPagination } from '../utils/pagination/CheckPagination';
import { EventDoesNotExistsException } from './exceptions/EventDoesNotExistsException';
import { checkArgument } from '../../utils/preconditions';
import { arrayMinSize, isArray, isDateString, isDefined, isNotEmpty, isPositive, minDate } from 'class-validator';
import { Organizer } from '../../data/models/Organizer';
import { OrganizerNotificationSettings } from '../../data/models/OrganizerNotificationSettings';
import { EventStartDateValidationException } from './exceptions/EventStartDateValidationException';
import { EventEndDateValidationException } from './exceptions/EventEndDateValidationException';
import { EventRegistrationStartDateValidationException } from './exceptions/EventRegistrationStartDateValidationException';
import { EventRegistrationEndDateValidationException } from './exceptions/EventRegistrationEndDateValidationException';
import { EventDateIntervalValidationException } from './exceptions/EventDateIntervalValidationException';
import { EventRegistrationDateIntervalValidationException } from './exceptions/EventRegistrationDateIntervalValidationException';
import { EventNameValidationException } from './exceptions/EventNameValidationException';
import { EventDescriptionValidationException } from './exceptions/EventDescriptionValidationException';
import { EventHostingClubsValidationException } from './exceptions/EventHostingClubsValidationException';
import { EventChiefOrganizersValidationException } from './exceptions/EventChiefOrganizersValidationException';
import { JwtService } from '@nestjs/jwt';
import { EventContext, EventToken } from '../auth/tokens/EventToken';
import { AccessContext } from '../auth/tokens/AccessToken';
import { User } from '../../data/models/User';
import { Club } from '../../data/models/Club';
import { BaseManager, Manager } from '../utils/BaseManager';
import {
	AuthContext,
	AuthEvent,
	AuthorizeGuard,
	IsAdmin, IsChiefOrganizer,
	IsManager,
	IsOrganizer, IsRegistered,
	IsUser
} from '../auth/AuthorizeGuard';
import { UnauthorizedException } from '../utils/permissions/UnauthorizedException';
import { EventRelation, EventRelationType } from './EventRelation';
import { nameof } from '../../utils/nameof';
import { TemporaryIdentity } from '../../data/models/TemporaryIdentity';
import { Registration } from '../../data/models/Registration';
import { Tag } from '../../data/models/Tag';
import { BusinessException } from '../utils/BusinessException';
import {
	ClubRepository,
	EventRepository,
	OrganizerRepository,
	RegistrationRepository, TemporaryIdentityRepository,
	UserRepository
} from '../../data/repositories/repositories';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { EventUniqueNameValidationException } from './exceptions/EventUniqueNameValidationException';
import { EventCapacityValidationException } from './exceptions/EventCapacityValidationException';

/* eslint-enable max-len */

@Manager()
export class EventManager extends BaseManager {
	public constructor(
		@InjectRepository(EventRepository) private readonly eventRepository: EventRepository,
		@InjectRepository(OrganizerRepository) private readonly organizerRepository: OrganizerRepository,
		@InjectRepository(RegistrationRepository) private readonly registrationRepository: RegistrationRepository,
		@InjectRepository(UserRepository) private readonly userRepository: UserRepository,
		@InjectRepository(ClubRepository) private readonly clubRepository: ClubRepository,
		@InjectRepository(TemporaryIdentityRepository)
		private readonly tempIdentityRepository: TemporaryIdentityRepository,
		private readonly jwtService: JwtService
	) {
		super();
	}

	@AuthorizeGuard(IsAdmin())
	public async getAllEvents(
		@AuthContext() _accessContext: AccessContext
	): Promise<{ events: Event[], count: number}> {
		const [events, count] = await this.eventRepository.findAndCount();
		return { events, count };
	}

	@AuthorizeGuard(IsUser(), IsAdmin())
	public async getAllEventsPaginated(
		@AuthContext() accessContext: AccessContext,
		pageSize: number, offset: number
	): Promise<{ events: Event[], count: number}> {
		checkPagination(pageSize, offset);

		const [events, count] = await this.eventRepository.findAndCount({
			take: pageSize,
			skip: offset * pageSize
		});

		return { events, count };
	}

	@AuthorizeGuard(IsUser(), IsAdmin())
	public async findEventsPaginated(
		@AuthContext() accessContext: AccessContext,
		pageSize: number, offset: number,
		criteria: { tags?: [Tag], name?: string }
	): Promise<{ events: Event[], count: number}> {
		checkPagination(pageSize, offset);

		let whereCriteria = {};
		if(criteria.tags) {
			whereCriteria = {
				...whereCriteria,
				tags: In(criteria.tags)
			};
		}
		if(typeof criteria.name === 'string') {
			whereCriteria = {
				...whereCriteria,
				name: Like(`%${criteria.name}%`)
			};
		}

		const [events, count] = await this.eventRepository.findAndCount({
			take: pageSize,
			skip: offset * pageSize,
			where: whereCriteria
		});

		return { events, count };
	}

	public async getEventById(
		id: string
	): Promise<Event> {
		const event = await this.eventRepository.findOne({ id }, {});

		if(!event) {
			return this.getEventFail(id);
		}
		else {
			return this.getEvent(event);
		}
	}

	public async getEventByUniqueName(
		uniqueName: string
	): Promise<Event> {
		const event = await this.eventRepository.findOne({ uniqueName }, {});

		if(!event) {
			return this.getEventFail(uniqueName);
		}
		else {
			return this.getEvent(event);
		}
	}

	public async getEvent(
		event: Event
	): Promise<Event> {
		return event;
	}

	private async getEventFail(
		id: string
	): Promise<Event> {
		throw new EventDoesNotExistsException(id);
	}

	@Transactional()
	@AuthorizeGuard(IsManager(), IsAdmin())
	public async addEvent(
		@AuthContext() accessContext: AccessContext,
		name: string,
		uniqueName: string,
		description: string,
		isClosedEvent: boolean,
		hostingClubs: Club[],
		chiefOrganizers: User[],
		settings: {
			place?: string, capacity?: number,
			start?: Date, end?: Date, isDateOrTime?: boolean,
			registrationStart?: Date, registrationEnd?: Date, registrationAllowed?: boolean
		}
	): Promise<Event> {
		EventManager.validateEvent(name, uniqueName, description, isClosedEvent, hostingClubs, settings);
		checkArgument(
			isArray(chiefOrganizers) && arrayMinSize(chiefOrganizers, 1),
			EventChiefOrganizersValidationException
		);

		if(!accessContext.isAdmin() && !hostingClubs.some(club => accessContext.isManagerOfClub(club))) {
			throw new UnauthorizedException();
		}

		if(typeof (await this.eventRepository.findOne({ uniqueName })) !== 'undefined') {
			throw new EventUniqueNameValidationException();
		}

		const event = new Event({
			name: name,
			uniqueName: uniqueName,
			description: description,
			isClosedEvent: isClosedEvent,
			place: settings.place,
			capacity: settings.capacity,
			start: settings.start,
			end: settings.end,
			isDateOrTime: settings.isDateOrTime,
			registrationStart: settings.registrationStart,
			registrationEnd: settings.registrationEnd,
			registrationAllowed: settings.registrationAllowed,
			hostingClubs: hostingClubs
		});

		await this.eventRepository.save(event);

		const organizers = chiefOrganizers
			.map(user => new Organizer({
				event: event, user: user, isChief: true, notificationSettings: OrganizerNotificationSettings.ALL
			}));
		await this.organizerRepository.save(organizers);

		return event;
	}

	@Transactional()
	@AuthorizeGuard(IsChiefOrganizer())
	public async editEvent(
		@AuthContext() eventContext: EventContext,
		@AuthEvent() event: Event,
		name: string,
		uniqueName: string,
		description: string,
		isClosedEvent: boolean,
		hostingClubsIds: string[],
		settings: {
			place?: string, capacity?: number,
			start?: Date, end?: Date, isDateOrTime?: boolean,
			registrationStart?: Date, registrationEnd?: Date, registrationAllowed?: boolean
		}
	): Promise<Event> {
		const hostingClubs = await this.clubRepository.findByIds(hostingClubsIds);
		EventManager.validateEvent(name, uniqueName, description, isClosedEvent, hostingClubs, settings);

		const uniqueNameUsed = await this.eventRepository.findOne({
			uniqueName: uniqueName,
			id: Not(event.id)
		});
		if(typeof uniqueNameUsed !== 'undefined') {
			throw new EventUniqueNameValidationException();
		}

		event.name = name;
		event.description = description;
		event.isClosedEvent = isClosedEvent;
		event.place = settings.place;
		event.capacity = settings.capacity;
		event.start = settings.start;
		event.end = settings.end;
		event.isDateOrTime = settings.isDateOrTime ?? event.isDateOrTime;
		event.registrationStart = settings.registrationStart;
		event.registrationEnd = settings.registrationEnd;
		event.registrationAllowed = settings.registrationAllowed;
		event.hostingClubs = hostingClubs;

		await this.eventRepository.save(event);

		return event;
	}

	@Transactional()
	@AuthorizeGuard(IsChiefOrganizer())
	public async deleteEvent(
		@AuthContext() eventContext: EventContext,
		@AuthEvent() event: Event
	): Promise<void> {
		await this.eventRepository.remove(event);
	}

	@Transactional()
	@AuthorizeGuard(IsUser(), IsAdmin())
	public async getEventToken(
		@AuthContext() accessContext: AccessContext,
		@AuthEvent() event: Event
	): Promise<string> {
		await event.loadRelation(this.eventRepository, 'hostingClubs', 'organizers', 'registrations');

		const registered = event.registrations
			.find(registration => registration.user?.id === accessContext.getUserId());

		const organizing = event.organizers
			.find(organizer => organizer.user.id === accessContext.getUserId());

		const managerOfHost = event.hostingClubs
			.some(club => accessContext.isManagerOfClub(club));

		const isOrganizing = typeof organizing !== 'undefined' || managerOfHost || accessContext.isAdmin();
		const isChief = (accessContext.isAdmin() || managerOfHost) ? true : organizing?.isChief ?? false;

		return this.jwtService.sign({
			typ: 'event',
			eid: event.id,
			reg: registered ? { typ: 'per', rid: registered.id } : 'none',
			org: isOrganizing
				? {
					uid: accessContext.getUserId(),
					chf: isChief,
					typ: organizing ? 'per' : 'tmp'
				}
				: 'none'
		} as EventToken, {
			expiresIn: '5m'
		});
	}

	@AuthorizeGuard(IsChiefOrganizer())
	public async getRelatedUsers(
		@AuthContext() _accessContext: AccessContext,
		@AuthEvent() event: Event
	): Promise<{ relations: EventRelation[], count: number }> {
		await event.loadRelation(this.eventRepository, 'hostingClubs', 'organizers', 'registrations');

		const [users, count] = await this.userRepository.findAndCount({
			relations: [nameof<Club>('memberships')]
		});

		const [temporaryIdentities, countTemps] = await this.tempIdentityRepository.findAndCount({
			relations: [nameof<TemporaryIdentity>('registration')]
		});

		return this.returnRelatedUsers(event, users, temporaryIdentities, count + countTemps);
	}

	@AuthorizeGuard(IsOrganizer())
	public async getRelatedUsersPaginated(
		@AuthContext() eventContext: EventContext,
		@AuthEvent() event: Event,
		pageSize: number, offset: number,
		options?: {
			registered?: boolean,
			attended?: boolean,
			organizer?: boolean,
			chiefOrganizer?: boolean,
			name?: string
		}
	): Promise<{ relations: EventRelation[], count: number }> {
		checkPagination(pageSize, offset);
		await event.loadRelation(this.eventRepository, 'hostingClubs', 'organizers', 'registrations');

		const [users, count] = await this.userRepository.findAndCount({
			relations: [nameof<Club>('memberships')],
			take: pageSize,
			skip: offset * pageSize,
			where: [
				options?.registered === true
					? {
						id: In(event.registrations
							.map(registration => registration.user?.id)
							.filter(id => typeof id !== 'undefined')),
						name: typeof options.name === 'string' ? Like(`%${options.name}%`) : undefined
					}
					: null,
				options?.registered === false
					? {
						id: Not(In(event.registrations
							.map(registration => registration.user?.id)
							.filter(id => typeof id !== 'undefined'))),
						name: typeof options.name === 'string' ? Like(`%${options.name}%`) : undefined
					}
					: null,
				options?.attended === true
					? {
						id: In(event.registrations
							.filter(registration => registration.attendDate)
							.map(registration => registration.user?.id)
							.filter(id => typeof id !== 'undefined')),
						name: typeof options.name === 'string' ? Like(`%${options.name}%`) : undefined
					}
					: null,
				options?.attended === false
					? {
						id: In(event.registrations
							.filter(registration => !registration.attendDate)
							.map(registration => registration.user?.id)
							.filter(id => typeof id !== 'undefined')),
						name: typeof options.name === 'string' ? Like(`%${options.name}%`) : undefined
					}
					: null,
				options?.organizer === true
					? {
						id: In(event.organizers.map(organizer => organizer.user.id)),
						name: typeof options.name === 'string' ? Like(`%${options.name}%`) : undefined
					}
					: null,
				options?.organizer === false
					? {
						id: Not(In(event.organizers.map(organizer => organizer.user.id))),
						name: typeof options.name === 'string' ? Like(`%${options.name}%`) : undefined
					}
					: null,
				options?.chiefOrganizer === true
					? {
						id: In(event.organizers
							.filter(organizer => organizer.isChief)
							.map(organizer => organizer.user.id)),
						name: typeof options.name === 'string' ? Like(`%${options.name}%`) : undefined
					}
					: null,
				options?.chiefOrganizer === false
					? {
						id: In(event.organizers
							.filter(organizer => !organizer.isChief)
							.map(organizer => organizer.user.id)),
						name: typeof options.name === 'string' ? Like(`%${options.name}%`) : undefined
					}
					: null
			].filter(condition => condition !== null).map((condition) => {
				if(typeof condition!.name === 'undefined') {
					delete condition!.name;
				}
				return condition;
			})
		});

		if(
			offset * pageSize > count
			&& (
				(typeof options?.registered === 'boolean' && options.registered)
				|| (typeof options?.attended === 'boolean')
			)
		) {
			const [temporaryIdentities, countTemps] = await this.tempIdentityRepository.findAndCount({
				relations: [nameof<TemporaryIdentity>('registration')],
				take: (offset * pageSize < count + pageSize) ? ((offset * pageSize) - count) : pageSize,
				skip: (offset * pageSize) - count,
				where: [
					options.registered === true
						? {
							name: typeof options.name === 'string' ? Like(`%${options.name}%`) : undefined
						}
						: null,
					options.attended === true
						? {
							registration: { attendDate: Not(null) },
							name: typeof options.name === 'string' ? Like(`%${options.name}%`) : undefined
						}
						: null,
					options.attended === false
						? {
							registration: { attendDate: null },
							name: typeof options.name === 'string' ? Like(`%${options.name}%`) : undefined
						}
						: null
				].filter(condition => condition !== null).map(condition => ({
					...condition,
					registration: {
						id: In(event.registrations.map(registration => registration.id))
					}
				}))
			});

			return this.returnRelatedUsers(event, users, temporaryIdentities, count + countTemps);
		}
		else {
			return this.returnRelatedUsers(event, users, [], count);
		}
	}

	@AuthorizeGuard(IsRegistered(), IsOrganizer())
	public async getSelfRelation(
		@AuthContext() eventContext: EventContext,
		@AuthEvent() event: Event
	): Promise<EventRelation> {
		await event.loadRelation(this.eventRepository, 'hostingClubs', 'organizers', 'registrations');

		const organizer = eventContext.isOrganizer(event)
			? (await this.userRepository.findByIds([eventContext.getUserId()], {
				relations: [nameof<Club>('memberships')]
			}))[0]
			: null;

		const registration = eventContext.isRegistered(event)
			? (await this.registrationRepository.findByIds([eventContext.getRegistrationId()]))[0]
			: null;

		if(organizer) {
			return (await this.returnRelatedUsers(event, [organizer], [], 1)).relations[0];
		}
		else if(registration) {
			return (await this.returnRelatedUsers(
				event,
				registration.user ? [registration.user] : [],
				registration.temporaryIdentity ? [registration.temporaryIdentity] : [],
				1
			)).relations[0];
		}
		else {
			throw new BusinessException('UNKNOWN_ERROR', 'Should not happen');
		}
	}

	@AuthorizeGuard(IsUser(), IsAdmin())
	public async getSelfRelation2(
		@AuthContext() accessContext: AccessContext,
		@AuthEvent() event: Event
	): Promise<EventRelation> {
		await event.loadRelation(this.eventRepository, 'hostingClubs', 'organizers', 'registrations');
		const user = await this.userRepository.findOne(accessContext.getUserId(), {
			relations: [nameof<Club>('memberships')]
		});

		return (await this.returnRelatedUsers(event, [user!], [], 1)).relations[0];
	}

	@AuthorizeGuard(IsOrganizer())
	public async getUserRelation(
		@AuthContext() eventContext: EventContext,
		@AuthEvent() event: Event,
		users: User[]
	): Promise<EventRelation[]> {
		await event.loadRelation(this.eventRepository, 'hostingClubs', 'organizers', 'registrations');
		const users2 = await this.userRepository.findByIds(users.map(u => u.id), {
			relations: [nameof<User>('memberships')]
		});
		return (await this.returnRelatedUsers(event, users2, [], users.length)).relations;
	}

	private async returnRelatedUsers(
		event: Event, users: User[], temporaryIdentities: TemporaryIdentity[], count: number
	): Promise<{ relations: EventRelation[], count: number }> {
		const relations = users.map((user) => {
			let relation = EventRelationType.NONE;
			let registration: Registration | undefined;
			let organizer: Organizer | undefined;

			if(event.registrations.some(reg => reg.user?.id === user.id)) {
				relation = relation | EventRelationType.REGISTERED;
				registration = event.registrations.find(reg => reg.user?.id === user.id)!;
			}
			if(event.registrations.some(reg => reg.user?.id === user.id && reg.attendDate)) {
				relation = relation | EventRelationType.ATTENDED;
			}
			if(event.organizers.some(org => org.user.id === user.id)) {
				relation = relation | EventRelationType.ORGANIZER;
				organizer = event.organizers.find(org => org.user.id === user.id)!;
			}
			if(event.organizers.some(org => org.user.id === user.id && org.isChief)) {
				relation = relation | EventRelationType.CHIEF_ORGANIZER;
			}
			if(user.memberships.some(membership => event.hostingClubs.some(club => club.id === membership.club.id))) {
				relation = relation | EventRelationType.HOSTING_MEMBER;
			}
			return new EventRelation(user, relation, registration, organizer);
		});

		const temporaryRelations = temporaryIdentities.map((temporaryIdentity) => {
			const relation = EventRelationType.REGISTERED;
			const registration = event.registrations.find(reg => reg.temporaryIdentity === temporaryIdentity)!;
			return new EventRelation(temporaryIdentity, relation, registration);
		});

		return { relations: [...relations, ...temporaryRelations], count: count };
	}

	private static validateDatePair(start?: Date, end?: Date): void {
		checkArgument(
			!isDefined(start) || isDateString(start!.toString()), EventStartDateValidationException
		);
		checkArgument(
			!isDefined(end) || isDateString(end!.toString()), EventEndDateValidationException
		);

		checkArgument(
			!(start !== undefined && end !== undefined) || minDate(end, start),
			EventDateIntervalValidationException
		);
	}

	private static validateRegistrationDatePair(
		start?: Date, end?: Date
	): void {
		checkArgument(
			!isDefined(start) || isDateString(start!.toString()), EventRegistrationStartDateValidationException
		);
		checkArgument(
			!isDefined(end) || isDateString(end!.toString()), EventRegistrationEndDateValidationException
		);

		checkArgument(
			!(start !== undefined && end !== undefined) || minDate(end, start),
			EventRegistrationDateIntervalValidationException
		);
	}

	private static validateEvent(
		name: string,
		uniqueName: string,
		description: string,
		_isClosedEvent: boolean,
		hostingClubs: Club[],
		settings: {
			place?: string, capacity?: number,
			start?: Date, end?: Date, isDateOrTime?: boolean,
			registrationStart?: Date, registrationEnd?: Date, registrationAllowed?: boolean
		}
	): void {
		checkArgument(isNotEmpty(name), EventNameValidationException);
		checkArgument(
			isNotEmpty(uniqueName) && uniqueName.match(/^[a-zA-Z0-9](?:-[a-zA-Z0-9]*)$/u) !== null,
			EventUniqueNameValidationException
		);
		checkArgument(isNotEmpty(description), EventDescriptionValidationException);
		checkArgument(
			!isDefined(settings.capacity) || isPositive(settings.capacity!), EventCapacityValidationException
		);
		checkArgument(
			isArray(hostingClubs) && arrayMinSize(hostingClubs, 1),
			EventHostingClubsValidationException
		);
		EventManager.validateDatePair(settings.start, settings.end);
		EventManager.validateRegistrationDatePair(settings.registrationStart, settings.registrationEnd);
	}
}