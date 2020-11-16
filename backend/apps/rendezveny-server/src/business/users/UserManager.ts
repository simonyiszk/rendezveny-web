/* eslint-disable max-len */
import { User } from '../../data/models/User';
import { checkArgument } from '../../utils/preconditions';
import { UserDoesNotExistsException } from './exceptions/UserDoesNotExistsException';
import { UserRole } from '../../data/models/UserRole';
import { CryptoService } from '../crypto/CryptoService';
import { UserNameValidationException } from './exceptions/UserNameValidationException';
import { UserUserNameValidationException } from './exceptions/UserUserNameValidationException';
import { isEmail, isNotEmpty, matches, minLength } from 'class-validator';
import { UserEmailValidationException } from './exceptions/UserEmailValidationException';
import { UserPasswordValidationException } from './exceptions/UserPasswordValidationException';
import { LocalIdentity } from '../../data/models/LocalIdentity';
import { LocalIdentityUserExistsWithEmailException } from './exceptions/LocalIdentityUserExistsWithEmailException';
import { LocalIdentityUserExistsWithUsernameException } from './exceptions/LocalIdentityUserExistsWithUsernameException';
import { checkPagination } from '../utils/pagination/CheckPagination';
import { InjectRepository } from '@nestjs/typeorm';
import { ClubMembership } from '../../data/models/ClubMembership';
import { AccessContext } from '../auth/tokens/AccessToken';
import { BaseManager, Manager } from '../utils/BaseManager';
import {
	AuthContext,
	AuthEvent,
	AuthorizeGuard,
	AuthUser,
	IsAdmin,
	IsManager,
	IsSameUser
} from '../auth/AuthorizeGuard';
import { Event } from '../../data/models/Event';
import {
	ClubMembershipRepository,
	LocalIdentityRepository,
	UserRepository
} from '../../data/repositories/repositories';
import { Transactional } from 'typeorm-transactional-cls-hooked';
/* eslint-enable max-len */

@Manager()
export class UserManager extends BaseManager {
	public constructor(
		@InjectRepository(UserRepository) private readonly userRepository: UserRepository,
		@InjectRepository(LocalIdentityRepository) private readonly localIdentityRepository: LocalIdentityRepository,
		@InjectRepository(ClubMembershipRepository) private readonly membershipRepository: ClubMembershipRepository,
		private readonly cryptoService: CryptoService
	) {
		super();
	}

	@AuthorizeGuard(IsAdmin())
	public async getAllUsers(
		@AuthContext() _accessContext: AccessContext
	): Promise<{ users: User[], count: number}> {
		const [users, count] = await this.userRepository.findAndCount();
		return { users, count };
	}

	@AuthorizeGuard(IsAdmin())
	public async getAllUsersPaginated(
		@AuthContext() _accessContext: AccessContext,
		pageSize: number, offset: number
	): Promise<{ users: User[], count: number}> {
		checkPagination(pageSize, offset);

		const [users, count] = await this.userRepository.findAndCount({
			take: pageSize,
			skip: offset * pageSize
		});

		return { users, count };
	}

	public async getUserById(
		accessContext: AccessContext,
		id: string,
		options?: { event?: Event }
	): Promise<User> {
		const user = await this.userRepository.findOne({ id });

		if(!user) {
			return this.getUserFail(accessContext, id, options?.event);
		}
		else {
			return this.getUser(accessContext, user, options?.event);
		}
	}

	@AuthorizeGuard(IsSameUser(), IsManager(), IsAdmin())
	public async getUser(
		@AuthContext() _accessContext: AccessContext,
		@AuthUser() user: User,
		@AuthEvent() _event?: Event
	): Promise<User> {
		return user;
	}

	@AuthorizeGuard(IsManager(), IsAdmin())
	private async getUserFail(
		@AuthContext() _accessContext: AccessContext,
		id: string,
		@AuthEvent() _event?: Event
	): Promise<User> {
		throw new UserDoesNotExistsException(id);
	}

	@Transactional()
	@AuthorizeGuard(IsAdmin())
	public async addUserWithLocalIdentity(
		@AuthContext() accessContext: AccessContext,
		name: string, username: string, email: string, password: string
	): Promise<User> {
		checkArgument(isNotEmpty(name), UserNameValidationException);
		checkArgument(isNotEmpty(username), UserUserNameValidationException);
		checkArgument(isEmail(email), UserEmailValidationException);
		UserManager.checkPassword(password);

		const identityWithEmail = await this.localIdentityRepository.findOne({ email });
		if(!identityWithEmail) {
			throw new LocalIdentityUserExistsWithEmailException(email);
		}

		const identityWithUsername = await this.localIdentityRepository.findOne({ username });
		if(!identityWithUsername) {
			throw new LocalIdentityUserExistsWithUsernameException(username);
		}

		const user = new User({ name });
		await this.userRepository.save(user);

		const { hashedPassword, salt } = await this.cryptoService.hashPassword(password, 1);
		const localIdentity = new LocalIdentity({
			username: username,
			email: email,
			password: hashedPassword,
			salt: salt,
			passwordVersion: 1,
			user: user
		});
		await this.localIdentityRepository.save(localIdentity);

		return user;
	}

	@Transactional()
	@AuthorizeGuard(IsSameUser(), IsAdmin())
	public async editUser(
		@AuthContext() _accessContext: AccessContext,
		@AuthUser() user: User,
		name: string
	): Promise<User> {
		checkArgument(isNotEmpty(name), UserNameValidationException);

		user.name = name;
		return this.userRepository.save(user);
	}

	@Transactional()
	@AuthorizeGuard(IsAdmin())
	public async editUserRole(
		@AuthContext() _accessContext: AccessContext,
		@AuthUser() user: User,
		role: UserRole
	): Promise<User> {
		user.role = role;
		return this.userRepository.save(user);
	}

	@Transactional()
	@AuthorizeGuard(IsAdmin())
	public async suspendUser(
		@AuthContext() _accessContext: AccessContext,
		@AuthUser() user: User
	): Promise<void> {
		user.isSuspended = true;
		await this.userRepository.save(user);
	}

	@Transactional()
	@AuthorizeGuard(IsAdmin())
	public async unsuspendUser(
		@AuthContext() _accessContext: AccessContext,
		@AuthUser() user: User
	): Promise<void> {
		user.isSuspended = false;
		await this.userRepository.save(user);
	}

	@AuthorizeGuard(IsSameUser(), IsManager(), IsAdmin())
	public async getAllClubMemberships(
		@AuthContext() _accessContext: AccessContext,
		@AuthUser() user: User
	): Promise<{ memberships: ClubMembership[], count: number}> {
		const memberships = await this.membershipRepository.find({ user });

		return {
			memberships: memberships,
			count: memberships.length
		};
	}

	@AuthorizeGuard(IsSameUser(), IsManager(), IsAdmin())
	public async getAllClubMembershipsPaginated(
		@AuthContext() _accessContext: AccessContext,
		@AuthUser() user: User,
		pageSize: number, offset: number
	): Promise<{ memberships: ClubMembership[], count: number}> {
		checkPagination(pageSize, offset);

		const [memberships, count] = await this.membershipRepository.findAndCount({
			where: { user },
			take: pageSize,
			skip: offset * pageSize
		});
		return {
			memberships,
			count
		};
	}

	@AuthorizeGuard(IsAdmin())
	public async getLocalIdentity(
		@AuthContext() _accessContext: AccessContext,
		@AuthUser() user: User
	): Promise<LocalIdentity | null> {
		return user.localIdentity ?? null;
	}

	private static checkPassword(password: string): void {
		checkArgument(
			// eslint-disable-next-line no-magic-numbers
			minLength(password, 8)
			&& matches(password, /(?:(?:.*\d)|(?:.*\W+))(?![.\n])(?:.*[A-Z])(?:.*[a-z]).*$/ug),
			UserPasswordValidationException,
			{
				version: 1,
				minLength: 8,
				containsUppercase: true,
				containsLowercase: true,
				containsNumber: true
			}
		);
	}
}