import { Args, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { ClubDTO, PaginatedClubDTO } from '../dtos/ClubDTO';
import { nameof } from '../../../utils/nameof';
import { PaginatedMembershipDTO } from '../dtos/MembershipDTO';
import { ClubManager } from '../../../business/clubs/ClubManager';
import { UseFilters, UseGuards } from '@nestjs/common';
import { BusinessExceptionFilter } from '../utils/BusinessExceptionFilter';
import { GraphQLBoolean } from 'graphql';
import { Offset, PageSize } from '../utils/PaginatedDTO';
import { MembershipResolver } from './MembershipResolver';
import { AccessContext, AuthAccessGuard } from '../../../business/auth/AuthAccessJwtStrategy';
import { AccessToken } from '../../../business/auth/AuthTokens';

@Resolver((_: never) => ClubDTO)
export class ClubsResolver {
	public constructor(
		private readonly clubManager: ClubManager
	) {}

	@Query(_ => PaginatedClubDTO, {
		name: 'clubs_getAll',
		description: 'Gets the clubs in the system'
	})
	@UseFilters(BusinessExceptionFilter)
	@UseGuards(AuthAccessGuard)
	public async getClubs(
		@AccessContext() accessContext: AccessToken,
		@PageSize() pageSize: number,
		@Offset() offset: number,
	): Promise<PaginatedClubDTO> {
		const { clubs, count } = await this.clubManager.getAllClubsPaginated(accessContext, pageSize, offset);

		return {
			nodes: clubs,
			totalCount: count,
			pageSize: pageSize,
			offset: offset
		};
	}

	@Query(_ => ClubDTO, {
		name: 'clubs_getOne',
		description: 'Gets one club based on its id'
	})
	@UseFilters(BusinessExceptionFilter)
	@UseGuards(AuthAccessGuard)
	public async getClub(
		@AccessContext() accessContext: AccessToken,
		@Args('id', { description: 'The id of the club' }) id: string
	): Promise<ClubDTO> {
		return this.clubManager.getClub(accessContext, id);
	}

	@Mutation(_ => ClubDTO, {
		name: 'clubs_addOne',
		description: 'Adds one club'
	})
	@UseFilters(BusinessExceptionFilter)
	@UseGuards(AuthAccessGuard)
	public async addClub(
		@AccessContext() accessContext: AccessToken,
		@Args('name', { description: 'The name of the club' }) name: string
	): Promise<ClubDTO> {
		return this.clubManager.addClub(accessContext, name);
	}

	@Mutation(_ => ClubDTO, {
		name: 'clubs_editOne',
		description: 'Edits one club'
	})
	@UseFilters(BusinessExceptionFilter)
	@UseGuards(AuthAccessGuard)
	public async editClub(
		@AccessContext() accessContext: AccessToken,
		@Args('id', { description: 'The id of the club' }) id: string,
		@Args('name', { description: 'The name of the club' }) name: string
	): Promise<ClubDTO> {
		return this.clubManager.editClub(accessContext, id, name);
	}

	@Mutation(_ => GraphQLBoolean, {
		name: 'clubs_deleteOne',
		description: 'Deletes one club'
	})
	@UseFilters(BusinessExceptionFilter)
	@UseGuards(AuthAccessGuard)
	public async deleteClub(
		@AccessContext() accessContext: AccessToken,
		@Args('id', { description: 'The id of the club' }) id: string
	): Promise<boolean> {
		await this.clubManager.deleteClub(accessContext, id);
		return true;
	}

	@ResolveField(nameof<ClubDTO>('clubMemberships'), _ => PaginatedMembershipDTO)
	@UseFilters(BusinessExceptionFilter)
	@UseGuards(AuthAccessGuard)
	public async getUserMemberships(
		@AccessContext() accessContext: AccessToken,
		@Parent() club: ClubDTO,
		@PageSize() pageSize: number,
		@Offset() offset: number,
	): Promise<PaginatedMembershipDTO> {
		const { memberships, count } = await this.clubManager.getAllClubMembershipsPaginated(
			accessContext, club.id, pageSize, offset
		);

		return {
			nodes: memberships.map(m => ({
				club: m.club,
				user: m.user,
				role: MembershipResolver.transformClubRole(m.clubRole)
			})),
			totalCount: count
		};
	}
}