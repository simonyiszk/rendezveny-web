/* eslint-disable @typescript-eslint/naming-convention,@typescript-eslint/ban-types */
import { User } from '../../data/models/User';
import { Club } from '../../data/models/Club';
import { Event } from '../../data/models/Event';
import 'reflect-metadata';
import { AccessContext } from './tokens/AccessToken';
import { UnauthorizedException } from '../utils/permissions/UnauthorizedException';
import { EventContext } from './tokens/EventToken';
import { Registration } from '../../data/models/Registration';

const contextMetadataKey = Symbol('context');
const userMetadataKey = Symbol('user');
const clubMetadataKey = Symbol('club');
const eventMetadataKey = Symbol('event');
const registrationMetadataKey = Symbol('registration');

export function AuthContext(): ParameterDecorator {
	return function(target: Object, propertyKey: string | symbol, parameterIndex: number): void {
		Reflect.defineMetadata(
			contextMetadataKey,
			parameterIndex,
			target,
			propertyKey
		);
	};
}

export function AuthUser(name?: string): ParameterDecorator {
	return function(target: Object, propertyKey: string | symbol, parameterIndex: number): void {
		const userParams: {[key: string]: number} = Reflect.getOwnMetadata(userMetadataKey, target, propertyKey) ?? [];
		userParams[name ?? 'default'] = parameterIndex;
		Reflect.defineMetadata(
			userMetadataKey,
			userParams,
			target,
			propertyKey
		);
	};
}

export function AuthClub(name?: string): ParameterDecorator {
	return function(target: Object, propertyKey: string | symbol, parameterIndex: number): void {
		const clubParams: {[key: string]: number} = Reflect.getOwnMetadata(clubMetadataKey, target, propertyKey) ?? [];
		clubParams[name ?? 'default'] = parameterIndex;
		Reflect.defineMetadata(
			clubMetadataKey,
			clubParams,
			target,
			propertyKey
		);
	};
}

export function AuthEvent(name?: string): ParameterDecorator {
	return function(target: Object, propertyKey: string | symbol, parameterIndex: number): void {
		const eventParams: {[key: string]: number} = Reflect
			.getOwnMetadata(eventMetadataKey, target, propertyKey) ?? [];
		eventParams[name ?? 'default'] = parameterIndex;
		Reflect.defineMetadata(
			eventMetadataKey,
			eventParams,
			target,
			propertyKey
		);
	};
}

export function AuthRegistration(name?: string): ParameterDecorator {
	return function(target: Object, propertyKey: string | symbol, parameterIndex: number): void {
		const eventParams: {[key: string]: number} = Reflect
			.getOwnMetadata(registrationMetadataKey, target, propertyKey) ?? [];
		eventParams[name ?? 'default'] = parameterIndex;
		Reflect.defineMetadata(
			registrationMetadataKey,
			eventParams,
			target,
			propertyKey
		);
	};
}

export type Guard =
	{ type: 'is_user' } |
	{ type: 'is_admin' } |
	{ type: 'is_manager' } |
	{ type: 'is_same_user', user: string } |
	{ type: 'is_manager_of_club', club: string } |
	{ type: 'is_member_of_club', club: string } |
	{ type: 'is_registered', event: string } |
	{ type: 'is_organizer', event: string } |
	{ type: 'is_chief_organizer', event: string };

export function IsUser(): { type: 'is_user' } & Guard {
	return { type: 'is_user' };
}

export function IsAdmin(): { type: 'is_admin' } & Guard {
	return { type: 'is_admin' };
}

export function IsManager(): { type: 'is_manager' } & Guard {
	return { type: 'is_manager' };
}

export function IsSameUser(name?: string): { type: 'is_same_user', user: string } & Guard {
	return { type: 'is_same_user', user: name ?? 'default' };
}

export function IsManagerOfClub(name?: string): { type: 'is_manager_of_club', club: string } & Guard {
	return { type: 'is_manager_of_club', club: name ?? 'default' };
}

export function IsMemberOfClub(name?: string): { type: 'is_member_of_club', club: string } & Guard {
	return { type: 'is_member_of_club', club: name ?? 'default' };
}

export function IsRegistered(name?: string): { type: 'is_registered', event: string } & Guard {
	return { type: 'is_registered', event: name ?? 'default' };
}

export function IsOrganizer(name?: string): { type: 'is_organizer', event: string } & Guard {
	return { type: 'is_organizer', event: name ?? 'default' };
}

export function IsChiefOrganizer(name?: string): { type: 'is_chief_organizer', event: string } & Guard {
	return { type: 'is_chief_organizer', event: name ?? 'default' };
}

export function AuthorizeGuard(...guards: Guard[]): MethodDecorator {
	return function(
		target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor
	): void {
		const func = descriptor.value;

		descriptor.value = async function(this: unknown, ...args: unknown[]): Promise<unknown> {
			const context = args[Reflect.getOwnMetadata(contextMetadataKey, target, propertyKey)];
			const users = Reflect.getOwnMetadata(userMetadataKey, target, propertyKey);
			const clubs = Reflect.getOwnMetadata(clubMetadataKey, target, propertyKey);
			const events = Reflect.getOwnMetadata(eventMetadataKey, target, propertyKey);
			const registrations = Reflect.getOwnMetadata(registrationMetadataKey, target, propertyKey);

			for(const guard of guards) {
				let isAuthorized = false;
				switch(guard.type) {
					case 'is_user': {
						if(context instanceof AccessContext) {
							isAuthorized = context.isUser();
						}
						break;
					}
					case 'is_admin': {
						if(context instanceof AccessContext) {
							isAuthorized = context.isAdmin();
						}
						break;
					}
					case 'is_manager': {
						if(context instanceof AccessContext) {
							isAuthorized = context.isManagerOfAnyClub();
						}
						break;
					}
					case 'is_same_user': {
						if(context instanceof AccessContext) {
							const user = args[users[guard.user]] as User;
							isAuthorized = context.isUser() && context.getUserId() === user.id;
						}
						break;
					}
					case 'is_manager_of_club': {
						if(context instanceof AccessContext) {
							const club = args[clubs[guard.club]] as Club;
							isAuthorized = context.isUser() && context.isManagerOfClub(club);
						}
						break;
					}
					case 'is_member_of_club': {
						if(context instanceof AccessContext) {
							const club = args[clubs[guard.club]] as Club;
							isAuthorized = context.isUser() && context.isMemberOfClub(club);
						}
						break;
					}
					case 'is_registered': {
						if(context instanceof EventContext) {
							const event = args[events[guard.event]] as Event;
							isAuthorized = context.isRegistered(event);
							if(typeof registrations !== 'undefined') {
								const registration = args[registrations[guard.event]] as Registration;
								isAuthorized = !context.isRegistered(event)
									|| context.getRegistrationId() === registration.id;
							}
						}
						break;
					}
					case 'is_organizer': {
						if(context instanceof EventContext) {
							const event = args[events[guard.event]] as Event;
							isAuthorized = context.isOrganizer(event);
						}
						break;
					}
					case 'is_chief_organizer': {
						if(context instanceof EventContext) {
							const event = args[events[guard.event]] as Event;
							isAuthorized = context.isChiefOrganizer(event);
						}
						break;
					}
					default: {
						throw new Error();
					}
				}

				if(isAuthorized) {
					// eslint-disable-next-line no-invalid-this
					return func.apply(this, args);
				}
			}

			throw new UnauthorizedException();
		};
	};
}