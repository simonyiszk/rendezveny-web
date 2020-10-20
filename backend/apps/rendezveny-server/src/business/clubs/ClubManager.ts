import { Injectable } from '@nestjs/common';
import { EntityManager, Repository, Transaction, TransactionManager } from 'typeorm';
import { Club } from '../../data/models/Club';
import { checkArgument } from '../../utils/preconditions';
import { ClubWithNameExistsException } from './exceptions/ClubWithNameExistsException';
import { ClubDoesNotExistsException } from './exceptions/ClubDoesNotExistsException';
import { ClubMembership } from '../../data/models/ClubMembership';
import { InjectRepository } from '@nestjs/typeorm';
import { nameof } from '../../utils/nameof';
import { checkPagination } from '../utils/pagination/CheckPagination';
import { isNotEmpty } from 'class-validator';
import { ClubNameValidationException } from './exceptions/ClubNameValidationException';
import { AccessContext } from '../auth/AuthTokens';
import { checkPermission } from '../utils/permissions/CheckPermissions';

@Injectable()
export class ClubManager {
	public constructor(
		@InjectRepository(Club) private readonly clubRepository: Repository<Club>,
		@InjectRepository(ClubMembership) private readonly membershipRepository: Repository<ClubMembership>
	) {}

	public async getAllClubs(
		accessContext: AccessContext
	): Promise<{ clubs: Club[], count: number}> {
		checkPermission(accessContext.isUser(), accessContext.isAdmin());

		const [clubs, count] = await this.clubRepository.findAndCount();
		return { clubs, count };
	}

	public async getAllClubsPaginated(
		accessContext: AccessContext, pageSize: number, offset: number
	): Promise<{ clubs: Club[], count: number}> {
		checkPagination(pageSize, offset);
		checkPermission(accessContext.isUser(), accessContext.isAdmin());

		const [clubs, count] = await this.clubRepository.findAndCount({
			take: pageSize,
			skip: offset * pageSize
		});

		return { clubs, count };
	}

	public async getClub(
		accessContext: AccessContext, id: string
	): Promise<Club> {
		checkPermission(accessContext.isUser(), accessContext.isAdmin());

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
		accessContext: AccessContext, name: string,
		@TransactionManager() _entityManager?: EntityManager
	): Promise<Club> {
		checkArgument(isNotEmpty(name), ClubNameValidationException);
		checkPermission(accessContext.isAdmin());

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
		accessContext: AccessContext, id: string, name: string,
		@TransactionManager() _entityManager?: EntityManager
	): Promise<Club> {
		checkArgument(isNotEmpty(name), ClubNameValidationException);
		checkPermission(accessContext.isAdmin());

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
		accessContext: AccessContext, id: string,
		@TransactionManager() _entityManager?: EntityManager
	): Promise<void> {
		checkPermission(accessContext.isAdmin());

		const club = await this.clubRepository.findOne({ id });

		if(!club) {
			throw new ClubDoesNotExistsException(id);
		}
		else {
			await this.clubRepository.remove(club);
		}
	}

	public async getAllClubMemberships(
		accessContext: AccessContext, id: string
	): Promise<{ memberships: ClubMembership[], count: number}> {
		const club = await this.clubRepository.findOne({ id }, {
			relations: [
				nameof<Club>('memberships')
			]
		});

		if(!club) {
			throw new ClubDoesNotExistsException(id);
		}

		checkPermission(
			accessContext.isUser() && accessContext.isManagerOfClub(club),
			accessContext.isAdmin()
		);


		return {
			memberships: club.memberships,
			count: club.memberships.length
		};
	}

	public async getAllClubMembershipsPaginated(
		accessContext: AccessContext, id: string, pageSize: number, offset: number
	): Promise<{ memberships: ClubMembership[], count: number}> {
		checkPagination(pageSize, offset);

		const club = await this.clubRepository.findOne({ id });

		if(!club) {
			throw new ClubDoesNotExistsException(id);
		}

		checkPermission(
			accessContext.isUser() && accessContext.isManagerOfClub(club),
			accessContext.isAdmin()
		);

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