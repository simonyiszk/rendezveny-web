import { Repository, Transaction, TransactionRepository } from 'typeorm';
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
import { AuthClub, AuthContext, AuthorizeGuard, IsAdmin, IsManagerOfClub, IsUser } from '../auth/AuthorizeGuard';

@Manager()
export class ClubManager extends BaseManager {
	public constructor(
		@InjectRepository(Club) private readonly clubRepository: Repository<Club>,
		@InjectRepository(ClubMembership) private readonly membershipRepository: Repository<ClubMembership>
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

	@Transaction()
	@AuthorizeGuard(IsAdmin())
	public async addClub(
		@AuthContext() accessContext: AccessContext,
		name: string,
		@TransactionRepository(Club) clubRepository?: Repository<Club>
	): Promise<Club> {
		checkArgument(isNotEmpty(name), ClubNameValidationException);

		const clubWithName = await clubRepository!.findOne({ name });

		if(clubWithName) {
			throw new ClubWithNameExistsException(name);
		}
		else {
			const club = new Club({ name });
			return clubRepository!.save(club);
		}
	}

	@Transaction()
	@AuthorizeGuard(IsAdmin())
	public async editClub(
		@AuthContext() accessContext: AccessContext,
		@AuthClub() club: Club,
		name: string,
		@TransactionRepository(Club) clubRepository?: Repository<Club>
	): Promise<Club> {
		checkArgument(isNotEmpty(name), ClubNameValidationException);

		const clubWithName = await clubRepository!.findOne({ name });

		if(clubWithName && club.id !== clubWithName.id) {
			throw new ClubWithNameExistsException(name);
		}
		else {
			club.name = name;
			return clubRepository!.save(club);
		}
	}

	@AuthorizeGuard(IsAdmin())
	public async deleteClub(
		@AuthContext() accessContext: AccessContext,
		@AuthClub() club: Club
	): Promise<void> {
		await this.clubRepository.remove(club);
	}

	@AuthorizeGuard(IsManagerOfClub(), IsAdmin())
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

	@AuthorizeGuard(IsManagerOfClub(), IsAdmin())
	public async getAllClubMembershipsPaginated(
		@AuthContext() accessContext: AccessContext,
		@AuthClub() club: Club,
		pageSize: number, offset: number
	): Promise<{ memberships: ClubMembership[], count: number}> {
		checkPagination(pageSize, offset);

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