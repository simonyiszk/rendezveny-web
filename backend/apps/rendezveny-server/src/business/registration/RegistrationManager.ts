/* eslint-disable max-len */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Event } from '../../data/models/Event';
import { UserManager } from '../users/UserManager';
import { Registration } from '../../data/models/Registration';
import { EventManager } from '../events/EventManager';
import { RegistrationClosedEventException } from './exceptions/RegistrationClosedEventException';
import { RegistrationAllreadyRegisteredException } from './exceptions/RegistrationAllreadyRegisteredException';
import { DEFAULT, RegistrationNotificationSettings } from '../../data/models/RegistrationNotificationSettings';
import { TemporaryIdentity } from '../../data/models/TemporaryIdentity';
import { RegistrationOutsideRegistrationPeriodException } from './exceptions/RegistrationOutsideRegistrationPeriodException';
import { checkArgument } from '../../utils/preconditions';
import { isEmail, isNotEmpty } from 'class-validator';
import { RegistrationNameValidationException } from './exceptions/RegistrationNameValidationException';
import { RegistrationEmailValidationException } from './exceptions/RegistrationEmailValidationException';
import { AccessContext } from '../auth/tokens/AccessToken';
import { EventContext } from '../auth/tokens/EventToken';
import {
	AuthContext,
	AuthEvent,
	AuthorizeGuard,
	AuthRegistration,
	IsAdmin,
	IsOrganizer,
	IsRegistered,
	IsUser
} from '../auth/AuthorizeGuard';
import { FilledInForm } from './Form';
import { FormManager } from './FormManager';
import { RegistrationDoesNotExistsException } from './exceptions/RegistrationDoesNotExistsException';
import { UserDoesNotExistsException } from '../users/exceptions/UserDoesNotExistsException';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import {
	EventRepository,
	RegistrationRepository,
	TemporaryIdentityRepository,
	UserRepository
} from '../../data/repositories/repositories';
import { RegistrationDisabledException } from './exceptions/RegistrationDisabledException';
import { RegistrationLimitReachedException } from './exceptions/RegistrationLimitReachedException';
/* eslint-enable max-len */

@Injectable()
export class RegistrationManager {
	public constructor(
		@InjectRepository(UserRepository) private readonly userRepository: UserRepository,
		@InjectRepository(EventRepository) private readonly eventRepository: EventRepository,
		@InjectRepository(RegistrationRepository) private readonly registrationRepository: RegistrationRepository,
		@InjectRepository(TemporaryIdentityRepository)
		private readonly tempIdentityRepository: TemporaryIdentityRepository,
		private readonly eventManager: EventManager,
		private readonly userManager: UserManager,
		private readonly formManager: FormManager
	) {}

	@AuthorizeGuard(IsRegistered(), IsOrganizer())
	public async getRegistrationById(
		@AuthContext() eventContext: EventContext,
		@AuthEvent() event: Event,
		id: string
	): Promise<Registration> {
		const registration = await this.registrationRepository.findOne({ id, event }, {});

		if (!registration) {
			return this.getRegistrationFail(id);
		} else {
			return this.getRegistration(eventContext, event, registration);
		}
	}

	@AuthorizeGuard(IsRegistered(), IsOrganizer())
	public async getRegistration(
		@AuthContext() _eventContext: EventContext,
		@AuthEvent() _event: Event,
		@AuthRegistration() registration: Registration
	): Promise<Registration> {
		return registration;
	}

	private async getRegistrationFail(id: string): Promise<Registration> {
		throw new RegistrationDoesNotExistsException(id);
	}

	@Transactional()
	@AuthorizeGuard(IsUser(), IsAdmin())
	public async registerSelf(
		@AuthContext() accessContext: AccessContext,
		@AuthEvent() event: Event,
		filledInForm: FilledInForm
	): Promise<Registration> {
		const user = await this.userRepository.findOne(accessContext.getUserId());
		if (typeof user === 'undefined') {
			throw new UserDoesNotExistsException(accessContext.getUserId());
		}

		await event.loadRelation(this.eventRepository, 'hostingClubs');
		if (
			event.isClosedEvent &&
			!event.hostingClubs.some((club) => accessContext.isMemberOfClub(club)) &&
			!accessContext.isAdmin()
		) {
			throw new RegistrationClosedEventException(event.hostingClubs);
		}

		const now = new Date();
		if (event.registrationAllowed === false && !accessContext.isAdmin()) {
			throw new RegistrationDisabledException();
		}
		if (event.registrationStart && event.registrationStart > now && !accessContext.isAdmin()) {
			throw new RegistrationOutsideRegistrationPeriodException();
		}
		if (event.registrationEnd && event.registrationEnd < now && !accessContext.isAdmin()) {
			throw new RegistrationOutsideRegistrationPeriodException();
		}

		const alreadyRegistered = await this.registrationRepository.count({ event });
		if (
			typeof event.capacity === 'number' &&
			event.capacity > 0 &&
			alreadyRegistered >= event.capacity &&
			!accessContext.isAdmin()
		) {
			throw new RegistrationLimitReachedException();
		}

		const registration = await this.registrationRepository.findOne({ user, event });
		if (registration) {
			throw new RegistrationAllreadyRegisteredException();
		}

		const newRegistration = new Registration({
			user: user,
			event: event,
			notificationSettings: DEFAULT,
			registrationDate: new Date()
		});
		await this.registrationRepository.save(newRegistration);

		await this.formManager.fillInForm(event, newRegistration, filledInForm);

		return newRegistration;
	}

	@Transactional()
	public async registerTemporarySelf(
		event: Event,
		name: string,
		email: string,
		filledInForm: FilledInForm
	): Promise<Registration> {
		checkArgument(isNotEmpty(name), RegistrationNameValidationException);
		checkArgument(isNotEmpty(email) && isEmail(email), RegistrationEmailValidationException);

		await event.loadRelation(this.eventRepository, 'hostingClubs');
		if (event.isClosedEvent) {
			throw new RegistrationClosedEventException(event.hostingClubs);
		}

		const registration = await this.registrationRepository.findOne({
			event: event,
			temporaryIdentity: { email }
		});
		if (registration) {
			throw new RegistrationAllreadyRegisteredException();
		}

		const now = new Date();
		if (event.registrationAllowed === false) {
			throw new RegistrationDisabledException();
		}
		if (event.registrationStart && event.registrationStart > now) {
			throw new RegistrationOutsideRegistrationPeriodException();
		}
		if (event.registrationEnd && event.registrationEnd < now) {
			throw new RegistrationOutsideRegistrationPeriodException();
		}

		const alreadyRegistered = await this.registrationRepository.count({ event });
		if (typeof event.capacity === 'number' && event.capacity > 0 && alreadyRegistered >= event.capacity) {
			throw new RegistrationLimitReachedException();
		}

		const temporaryIdentity = new TemporaryIdentity({ email, name });
		await this.tempIdentityRepository.save(temporaryIdentity);

		const newRegistration = new Registration({
			temporaryIdentity: temporaryIdentity,
			event: event,
			notificationSettings: DEFAULT,
			registrationDate: new Date()
		});
		await this.registrationRepository.save(newRegistration);

		await this.formManager.fillInForm(event, newRegistration, filledInForm);

		return newRegistration;
	}

	@Transactional()
	@AuthorizeGuard(IsOrganizer())
	public async registerUserByOrganizer(
		@AuthContext() eventContext: EventContext,
		@AuthEvent() event: Event,
		userId: string,
		filledInForm?: FilledInForm
	): Promise<Registration> {
		const user = await this.userRepository.findOne({ id: userId });
		if (!user) {
			throw new UserDoesNotExistsException(userId);
		}

		const registration = await this.registrationRepository.findOne({ user, event });
		if (registration) {
			throw new RegistrationAllreadyRegisteredException();
		}

		const newRegistration = new Registration({
			user: user,
			event: event,
			notificationSettings: DEFAULT,
			registrationDate: new Date()
		});
		await this.registrationRepository.save(newRegistration);

		if (filledInForm) {
			await this.formManager.fillInForm(event, newRegistration, filledInForm);
		}

		return newRegistration;
	}

	@Transactional()
	@AuthorizeGuard(IsOrganizer())
	public async attendRegistree(
		@AuthContext() eventContext: EventContext,
		@AuthEvent() event: Event,
		@AuthRegistration() registration: Registration
	): Promise<Registration> {
		registration.attendDate = new Date();
		await this.registrationRepository.save(registration);
		return registration;
	}

	@Transactional()
	@AuthorizeGuard(IsOrganizer())
	public async unattendRegistree(
		@AuthContext() eventContext: EventContext,
		@AuthEvent() event: Event,
		@AuthRegistration() registration: Registration
	): Promise<Registration> {
		registration.attendDate = null;
		await this.registrationRepository.save(registration);
		return registration;
	}

	@Transactional()
	@AuthorizeGuard(IsRegistered(), IsOrganizer())
	public async deleteRegistration(
		@AuthContext() eventContext: EventContext,
		@AuthEvent() event: Event,
		@AuthRegistration() registration: Registration
	): Promise<void> {
		await this.registrationRepository.remove(registration);
	}

	@Transactional()
	@AuthorizeGuard(IsOrganizer())
	public async updateNotificationSettings(
		@AuthEvent() event: Event,
		@AuthRegistration() registration: Registration,
		notificationsSettings: RegistrationNotificationSettings
	): Promise<Registration> {
		registration.notificationSettings = notificationsSettings;
		await this.registrationRepository.save(registration);
		return registration;
	}
}
