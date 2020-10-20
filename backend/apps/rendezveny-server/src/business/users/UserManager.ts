import { Injectable } from '@nestjs/common';
import { EntityManager, Repository, Transaction, TransactionManager } from 'typeorm';
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
import {
	LocalIdentityUserExistsWithUsernameException
} from './exceptions/LocalIdentityUserExistsWithUsernameException';
import { checkPagination } from '../utils/pagination/CheckPagination';
import { InjectRepository } from '@nestjs/typeorm';
import { ClubMembership } from '../../data/models/ClubMembership';
import { nameof } from '../../utils/nameof';
import { AccessContext } from '../auth/AuthTokens';
import { checkPermission } from '../utils/permissions/CheckPermissions';

@Injectable()
export class UserManager {
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

	public constructor(
		@InjectRepository(User) private readonly userRepository: Repository<User>,
		@InjectRepository(LocalIdentity) private readonly localIdentityRepository: Repository<LocalIdentity>,
		@InjectRepository(ClubMembership) private readonly membershipRepository: Repository<ClubMembership>,
		private readonly cryptoService: CryptoService
	) {}

	public async getAllUsers(
		accessContext: AccessContext
	): Promise<{ users: User[], count: number}> {
		checkPermission(accessContext.isAdmin());

		const [users, count] = await this.userRepository.findAndCount();
		return { users, count };
	}

	public async getAllUsersPaginated(
		accessContext: AccessContext, pageSize: number, offset: number
	): Promise<{ users: User[], count: number}> {
		checkPagination(pageSize, offset);
		checkPermission(accessContext.isAdmin());

		const [users, count] = await this.userRepository.findAndCount({
			take: pageSize,
			skip: offset * pageSize
		});

		return { users, count };
	}

	public async getUser(
		accessContext: AccessContext, id: string
	): Promise<User> {
		const user = await this.userRepository.findOne({ id }, {
			relations: [
				nameof<User>('memberships')
			]
		});

		if(!user) {
			throw new UserDoesNotExistsException(id);
		}

		checkPermission(
			accessContext.isUser() && accessContext.isSameUser(user),
			accessContext.isUser() && accessContext.isManagerOfUser(user),
			accessContext.isAdmin()
		);

		return user;
	}

	@Transaction()
	public async addUserWithLocalIdentity(
		accessContext: AccessContext, name: string, username: string, email: string, password: string,
	): Promise<User> {
		checkArgument(isNotEmpty(name), UserNameValidationException);
		checkArgument(isNotEmpty(username), UserUserNameValidationException);
		checkArgument(isEmail(email), UserEmailValidationException);
		UserManager.checkPassword(password);
		checkPermission(accessContext.isAdmin());

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


	public async editUser(
		accessContext: AccessContext, id: string, name: string,
		@TransactionManager() _entityManager?: EntityManager
	): Promise<User> {
		const user = await this.userRepository.findOne({ id });

		if(!user) {
			throw new UserDoesNotExistsException(id);
		}

		checkPermission(
			accessContext.isUser() && accessContext.isSameUser(user),
			accessContext.isAdmin()
		);

		user.name = name;
		return this.userRepository.save(user);
	}

	@Transaction()
	public async editUserRole(
		accessContext: AccessContext, id: string, role: UserRole,
		@TransactionManager() _entityManager?: EntityManager
	): Promise<User> {
		checkPermission(accessContext.isAdmin());

		const user = await this.userRepository.findOne({ id });

		if(!user) {
			throw new UserDoesNotExistsException(id);
		}
		else {
			user.role = role;
			return this.userRepository.save(user);
		}
	}

	@Transaction()
	public async suspendUser(
		accessContext: AccessContext, id: string,
		@TransactionManager() _entityManager?: EntityManager
	): Promise<void> {
		checkPermission(accessContext.isAdmin());

		const user = await this.userRepository.findOne({ id });

		if(!user) {
			throw new UserDoesNotExistsException(id);
		}
		else {
			user.isSuspended = true;
			await this.userRepository.save(user);
		}
	}

	@Transaction()
	public async unsuspendUser(
		accessContext: AccessContext, id: string,
		@TransactionManager() _entityManager?: EntityManager
	): Promise<void> {
		checkPermission(accessContext.isAdmin());

		const user = await this.userRepository.findOne({ id });

		if(!user) {
			throw new UserDoesNotExistsException(id);
		}
		else {
			user.isSuspended = false;
			await this.userRepository.save(user);
		}
	}

	public async getAllClubMemberships(
		accessContext: AccessContext, id: string
	): Promise<{ memberships: ClubMembership[], count: number}> {
		const user = await this.userRepository.findOne({ id }, {
			relations: [
				nameof<User>('memberships')
			]
		});

		if(!user) {
			throw new UserDoesNotExistsException(id);
		}

		checkPermission(
			accessContext.isUser() && accessContext.isSameUser(user),
			accessContext.isUser() && accessContext.isManagerOfUser(user),
			accessContext.isAdmin()
		);

		return {
			memberships: user.memberships,
			count: user.memberships.length
		};
	}

	public async getAllClubMembershipsPaginated(
		accessContext: AccessContext, id: string, pageSize: number, offset: number
	): Promise<{ memberships: ClubMembership[], count: number}> {
		checkPagination(pageSize, offset);

		const user = await this.userRepository.findOne({ id });

		if(!user) {
			throw new UserDoesNotExistsException(id);
		}

		checkPermission(
			accessContext.isUser() && accessContext.isSameUser(user),
			accessContext.isUser() && accessContext.isManagerOfUser(user),
			accessContext.isAdmin()
		);

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

	public async getLocalIdentity(
		accessContext: AccessContext, id: string
	): Promise<LocalIdentity | null> {
		checkPermission(accessContext.isAdmin());

		const user = await this.userRepository.findOne({ id }, {
			relations: [
				nameof<User>('localIdentity')
			]
		});

		if(!user) {
			throw new UserDoesNotExistsException(id);
		}
		else {
			return user.localIdentity ?? null;
		}
	}
}