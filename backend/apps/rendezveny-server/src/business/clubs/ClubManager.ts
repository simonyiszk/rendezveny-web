import { Injectable } from '@nestjs/common';
import { EntityManager, Repository, Transaction, TransactionManager } from 'typeorm';
import { Club } from '../../data/models/Club';
import { checkArgument } from '../../utils/preconditions';
import { ClubWithNameExistsException } from './ClubWithNameExistsException';
import { ClubDoesNotExistsException } from './ClubDoesNotExistsException';
import { ClubMembership } from '../../data/models/ClubMembership';
import { InjectRepository } from '@nestjs/typeorm';
import { nameof } from '../../utils/nameof';
import { checkPagination } from '../utils/CheckPagination';
import { isNotEmpty } from 'class-validator';
import { ClubNameValidationException } from './ClubNameValidationException';
import { AccessToken } from '../auth/AuthTokens';
import { checkPermission } from '../utils/CheckPermissions';
import { UserRole } from '../../data/models/UserRole';
import { ClubRole } from '../../data/models/ClubRole';

@Injectable()
export class ClubManager {
	public constructor(
		@InjectRepository(Club) private readonly clubRepository: Repository<Club>,
		@InjectRepository(ClubMembership) private readonly membershipRepository: Repository<ClubMembership>
	) {}

	public async getAllClubs(
		accessContext: AccessToken
	): Promise<{ clubs: Club[], count: number}> {
		checkPermission(accessContext.rol === UserRole.USER, accessContext.rol === UserRole.ADMIN);

		const [clubs, count] = await this.clubRepository.findAndCount();
		return { clubs, count };
	}

	public async getAllClubsPaginated(
		accessContext: AccessToken, pageSize: number, offset: number
	): Promise<{ clubs: Club[], count: number}> {
		checkPagination(pageSize, offset);
		checkPermission(accessContext.rol === UserRole.USER, accessContext.rol === UserRole.ADMIN);

		const [clubs, count] = await this.clubRepository.findAndCount({
			take: pageSize,
			skip: offset * pageSize
		});

		return { clubs, count };
	}

	public async getClub(
		accessContext: AccessToken, id: string
	): Promise<Club> {
		checkPermission(accessContext.rol === UserRole.USER, accessContext.rol === UserRole.ADMIN);

		const club = await this.clubRepository.findOne({ id });

		if(!club) {
			throw new ClubDoesNotExistsException(id);
		}
		else {
			return club;
		}
	}

	@Transaction()
	public async addClub(
		accessContext: AccessToken, name: string,
		@TransactionManager() _entityManager?: EntityManager
	): Promise<Club> {
		checkArgument(isNotEmpty(name), ClubNameValidationException);
		checkPermission(accessContext.rol === UserRole.ADMIN);

		const clubWithName = await this.clubRepository.findOne({ name });

		if(clubWithName) {
			throw new ClubWithNameExistsException(name);
		}
		else {
			const club = new Club({ name });
			return this.clubRepository.save(club);
		}
	}

	@Transaction()
	public async editClub(
		accessContext: AccessToken, id: string, name: string,
		@TransactionManager() _entityManager?: EntityManager
	): Promise<Club> {
		checkArgument(isNotEmpty(name), ClubNameValidationException);
		checkPermission(accessContext.rol === UserRole.ADMIN);

		const club = await this.clubRepository.findOne({ id });

		if(!club) {
			throw new ClubDoesNotExistsException(id);
		}
		else {
			club.name = name;
			return this.clubRepository.save(club, { });
		}
	}

	@Transaction()
	public async deleteClub(
		accessContext: AccessToken, id: string,
		@TransactionManager() _entityManager?: EntityManager
	): Promise<void> {
		checkPermission(accessContext.rol === UserRole.ADMIN);

		const club = await this.clubRepository.findOne({ id });

		if(!club) {
			throw new ClubDoesNotExistsException(id);
		}
		else {
			await this.clubRepository.remove(club);
		}
	}

	public async getAllClubMemberships(
		accessContext: AccessToken, id: string
	): Promise<{ memberships: ClubMembership[], count: number}> {
		checkPermission(
			(
				accessContext.rol === UserRole.USER
				&& accessContext.clb.filter(clb => clb.cid === id && clb.rol === ClubRole.CLUB_MANAGER).length > 0
			),
			accessContext.rol === UserRole.ADMIN
		);

		const club = await this.clubRepository.findOne({ id }, {
			relations: [
				nameof<Club>('memberships')
			]
		});

		if(!club) {
			throw new ClubDoesNotExistsException(id);
		}
		else {
			return {
				memberships: club.memberships,
				count: club.memberships.length
			};
		}
	}

	public async getAllClubMembershipsPaginated(
		accessContext: AccessToken, id: string, pageSize: number, offset: number
	): Promise<{ memberships: ClubMembership[], count: number}> {
		checkPagination(pageSize, offset);
		checkPermission(
			(
				accessContext.rol === UserRole.USER
				&& accessContext.clb.filter(clb => clb.cid === id && clb.rol === ClubRole.CLUB_MANAGER).length > 0
			),
			accessContext.rol === UserRole.ADMIN
		);

		const club = await this.clubRepository.findOne({ id });

		if(!club) {
			throw new ClubDoesNotExistsException(id);
		}
		else {
			const [memberships, count] = await this.membershipRepository.findAndCount({
				where: { club },
				take: pageSize,
				skip: offset * pageSize
			});
			return {
				memberships,
				count
			};
		}
	}
}