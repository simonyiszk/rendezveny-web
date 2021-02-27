import { Club } from '../../data/models/Club';
import { checkArgument } from '../../utils/preconditions';
import { ClubWithNameExistsException } from './exceptions/ClubWithNameExistsException';
import { ClubDoesNotExistsException } from './exceptions/ClubDoesNotExistsException';
import { ClubMembership } from '../../data/models/ClubMembership';
import { InjectRepository } from '@nestjs/typeorm';
import { checkPagination } from '../utils/pagination/CheckPagination';
import { isNotEmpty } from 'class-validator';
import { ClubNameValidationException } from './exceptions/ClubNameValidationException';
import { AccessContext } from '../auth/tokens/AccessToken';
import { BaseManager, Manager } from '../utils/BaseManager';
import { AuthClub, AuthContext, AuthorizeGuard, IsAdmin, IsManager, IsMemberOfClub, IsUser } from '../auth/AuthorizeGuard';
import { ClubMembershipRepository, ClubRepository } from '../../data/repositories/repositories';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { nameof } from '../../utils/nameof';
import { User } from '../../data/models/User';

@Manager()
export class ClubManager extends BaseManager {
	public constructor(
		@InjectRepository(ClubRepository) private readonly clubRepository: ClubRepository,
		@InjectRepository(ClubMembershipRepository) private readonly membershipRepository: ClubMembershipRepository
	) {
		super();
	}

	@AuthorizeGuard(IsUser(), IsAdmin())
	public async getAllClubs(
		@AuthContext() _accessContext: AccessContext
	): Promise<{ clubs: Club[], count: number}> {
		const [clubs, count] = await this.clubRepository.findAndCount();
		return { clubs, count };
	}

	@AuthorizeGuard(IsUser(), IsAdmin())
	public async getAllClubsPaginated(
		@AuthContext() _accessContext: AccessContext,
		pageSize: number, offset: number
	): Promise<{ clubs: Club[], count: number}> {
		checkPagination(pageSize, offset);

		const [clubs, count] = await this.clubRepository.findAndCount({
			take: pageSize,
			skip: offset * pageSize
		});

		return { clubs, count };
	}

	public async getClubById(
		@AuthContext() accessContext: AccessContext,
		id: string
	): Promise<Club> {
		const club = await this.clubRepository.findOne({ id });

		if(!club) {
			return this.getClubFail(accessContext, id);
		}
		else {
			return this.getClub(accessContext, club);
		}
	}

	@AuthorizeGuard(IsUser(), IsAdmin())
	public async getClub(
		@AuthContext() _accessContext: AccessContext,
		@AuthClub() club: Club
	): Promise<Club> {
		return club;
	}

	@AuthorizeGuard(IsUser(), IsAdmin())
	private async getClubFail(
		@AuthContext() _accessContext: AccessContext,
		id: string
	): Promise<Club> {
		throw new ClubDoesNotExistsException(id);
	}

	@Transactional()
	@AuthorizeGuard(IsAdmin())
	public async addClub(
		@AuthContext() accessContext: AccessContext,
		name: string,
		externalId: number
	): Promise<Club> {
		checkArgument(isNotEmpty(name), ClubNameValidationException);

		const clubWithName = await this.clubRepository.findOne({ name });

		if(clubWithName) {
			throw new ClubWithNameExistsException(name);
		}
		else {
			const club = new Club({ name, externalId });
			return this.clubRepository.save(club);
		}
	}

	@Transactional()
	@AuthorizeGuard(IsAdmin())
	public async editClub(
		@AuthContext() accessContext: AccessContext,
		@AuthClub() club: Club,
		name: string,
		externalId: number
	): Promise<Club> {
		checkArgument(isNotEmpty(name), ClubNameValidationException);

		const clubWithName = await this.clubRepository.findOne({ name });

		if(clubWithName && club.id !== clubWithName.id) {
			throw new ClubWithNameExistsException(name);
		}
		else {
			club.name = name;
			club.externalId = externalId;
			return this.clubRepository.save(club);
		}
	}

	@Transactional()
	@AuthorizeGuard(IsAdmin())
	public async deleteClub(
		@AuthContext() accessContext: AccessContext,
		@AuthClub() club: Club
	): Promise<void> {
		await this.clubRepository.remove(club);
	}

	@AuthorizeGuard(IsMemberOfClub(), IsManager(), IsAdmin())
	public async getAllClubMemberships(
		@AuthContext() accessContext: AccessContext,
		@AuthClub() club: Club
	): Promise<{ memberships: ClubMembership[], count: number}> {
		const memberships = await this.membershipRepository.find({ club });

		return {
			memberships: memberships,
			count: memberships.length
		};
	}

	@AuthorizeGuard(IsMemberOfClub(), IsManager(), IsAdmin())
	public async getAllClubMembershipsPaginated(
		@AuthContext() accessContext: AccessContext,
		@AuthClub() club: Club,
		pageSize: number,
		offset: number,
		searchForName?: string
	): Promise<{ memberships: ClubMembership[], count: number}> {
		checkPagination(pageSize, offset);

		const [memberships, count] = typeof searchForName === 'string'
			? await this.membershipRepository.createQueryBuilder('membership')
				.leftJoinAndSelect(`membership.${nameof<ClubMembership>('user')}`, 'user')
				.andWhere(`membership.${nameof<ClubMembership>('club')}.id = :clubId`, {
					clubId: club.id
				})
				.andWhere(`user.${nameof<User>('name')} like :searchForName`, {
					searchForName: `%${searchForName}%`
				})
				.take(pageSize)
				.skip(offset * pageSize)
				.getManyAndCount()
			: await this.membershipRepository.findAndCount({
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