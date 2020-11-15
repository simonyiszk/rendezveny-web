/* eslint-disable max-len */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Event } from '../../data/models/Event';
import { Repository, Transaction, TransactionRepository } from 'typeorm';
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
import { User } from '../../data/models/User';
import {
	AuthContext,
	AuthEvent,
	AuthorizeGuard, AuthRegistration,
	IsAdmin,
	IsOrganizer,
	IsRegistered,
	IsUser
} from '../auth/AuthorizeGuard';
import { FilledInForm } from './Form';
import { FormManager } from './FormManager';
import { RegistrationDoesNotExistsException } from './exceptions/RegistrationDoesNotExistsException';
/* eslint-enable max-len */

@Injectable()
export class RegistrationManager {
	public constructor(
		@InjectRepository(Event) private readonly eventRepository: Repository<Event>,
		@InjectRepository(Registration) private readonly registrationRepository: Repository<Registration>,
		@InjectRepository(TemporaryIdentity) private readonly tempIdentityRepository: Repository<TemporaryIdentity>,
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

		if(!registration) {
			return this.getRegistrationFail(id);
		}
		else {
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

	private async getRegistrationFail(
		id: string
	): Promise<Registration> {
		throw new RegistrationDoesNotExistsException(id);
	}

	@Transaction()
	@AuthorizeGuard(IsUser(), IsAdmin())
	public async registerSelf(
		@AuthContext() accessContext: AccessContext,
		@AuthEvent() event: Event,
		filledInForm: FilledInForm,
		@TransactionRepository(Event) eventRepository?: Repository<Event>,
		@TransactionRepository(Registration) registrationRepository?: Repository<Registration>
	): Promise<Registration> {
		const user = await this.userManager.getUserById(accessContext, accessContext.getUserId());

		await event.loadRelation(eventRepository!, 'hostingClubs');
		if(event.isClosedEvent && !event.hostingClubs.some(club => accessContext.isMemberOfClub(club))) {
			throw new RegistrationClosedEventException(event.hostingClubs);
		}

		const now = new Date();
		if(event.registrationStart && event.registrationStart > now) {
			throw new RegistrationOutsideRegistrationPeriodException();
		}
		if(event.registrationEnd && event.registrationEnd < now) {
			throw new RegistrationOutsideRegistrationPeriodException();
		}

		const registration = await registrationRepository!.findOne({ user });
		if(registration) {
			throw new RegistrationAllreadyRegisteredException();
		}

		const newRegistration = new Registration({
			user: user,
			event: event,
			notificationSettings: DEFAULT,
			registrationDate: new Date()
		});
		await registrationRepository!.save(newRegistration);

		await this.formManager.fillInForm(event, newRegistration, filledInForm);

		return newRegistration;
	}

	@Transaction()
	public async registerTemporarySelf(
		event: Event,
		name: string,
		email: string,
		filledInForm: FilledInForm,
		@TransactionRepository(Event) eventRepository?: Repository<Event>,
		@TransactionRepository(TemporaryIdentity) temporaryIdentityRepository?: Repository<TemporaryIdentity>,
		@TransactionRepository(Registration) registrationRepository?: Repository<Registration>
	): Promise<Registration> {
		checkArgument(isNotEmpty(name), RegistrationNameValidationException);
		checkArgument(isNotEmpty(email) && isEmail(email), RegistrationEmailValidationException);

		await event.loadRelation(eventRepository!, 'hostingClubs');
		if(event.isClosedEvent) {
			throw new RegistrationClosedEventException(event.hostingClubs);
		}

		const registration = await registrationRepository!.findOne({
			event: event, temporaryIdentity: { email }
		});
		if(registration) {
			throw new RegistrationAllreadyRegisteredException();
		}

		const now = new Date();
		if(event.registrationStart && event.registrationStart > now) {
			throw new RegistrationOutsideRegistrationPeriodException();
		}
		if(event.registrationEnd && event.registrationEnd < now) {
			throw new RegistrationOutsideRegistrationPeriodException();
		}

		const temporaryIdentity = new TemporaryIdentity({ email, name });
		await temporaryIdentityRepository!.save(temporaryIdentity);

		const newRegistration = new Registration({
			temporaryIdentity: temporaryIdentity,
			event: event,
			notificationSettings: DEFAULT,
			registrationDate: new Date()
		});
		await registrationRepository!.save(newRegistration);

		await this.formManager.fillInForm(event, newRegistration, filledInForm);

		return newRegistration;
	}

	@Transaction()
	@AuthorizeGuard(IsOrganizer())
	public async registerUserByOrganizer(
		@AuthContext() eventContext: EventContext,
		@AuthEvent() event: Event,
		user: User,
		filledInForm?: FilledInForm,
		@TransactionRepository(Event) eventRepository?: Repository<Event>,
		@TransactionRepository(Registration) registrationRepository?: Repository<Registration>
	): Promise<Registration> {
		const registration = await registrationRepository!.findOne({ user });
		if(registration) {
			throw new RegistrationAllreadyRegisteredException();
		}

		const newRegistration = new Registration({
			user: user,
			event: event,
			notificationSettings: DEFAULT,
			registrationDate: new Date()
		});
		await registrationRepository!.save(newRegistration);

		if(filledInForm) {
			await this.formManager.fillInForm(event, newRegistration, filledInForm);
		}

		return newRegistration;
	}

	@Transaction()
	@AuthorizeGuard(IsOrganizer())
	public async attendRegistree(
		@AuthEvent() event: Event,
		@AuthRegistration() registration: Registration,
		@TransactionRepository(Registration) registrationRepository?: Repository<Registration>
	): Promise<Registration> {
		registration.attendDate = new Date();
		await registrationRepository!.save(registration);
		return registration;
	}

	@Transaction()
	@AuthorizeGuard(IsOrganizer())
	public async unattendRegistree(
		@AuthEvent() event: Event,
		@AuthRegistration() registration: Registration,
		@TransactionRepository(Registration) registrationRepository?: Repository<Registration>
	): Promise<Registration> {
		registration.attendDate = undefined;
		await registrationRepository!.save(registration);
		return registration;
	}

	@Transaction()
	@AuthorizeGuard(IsOrganizer())
	public async updateNotificationSettings(
		@AuthEvent() event: Event,
		@AuthRegistration() registration: Registration,
		notificationsSettings: RegistrationNotificationSettings,
		@TransactionRepository(Registration) registrationRepository?: Repository<Registration>
	): Promise<Registration> {
		registration.attendDate = undefined;
		registration.notificationSettings = notificationsSettings;
		await registrationRepository!.save(registration);
		return registration;
	}
}