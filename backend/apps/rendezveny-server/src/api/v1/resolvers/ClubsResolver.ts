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
import { AccessCtx, AuthAccessGuard } from '../../../business/auth/passport/AuthAccessJwtStrategy';
import { AccessContext } from '../../../business/auth/tokens/AccessToken';
import { Transactional } from 'typeorm-transactional-cls-hooked';

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
		@AccessCtx() accessContext: AccessContext,
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
		@AccessCtx() accessContext: AccessContext,
		@Args('id', { description: 'The id of the club' }) id: string
	): Promise<ClubDTO> {
		return this.clubManager.getClubById(accessContext, id);
	}

	@Mutation(_ => ClubDTO, {
		name: 'clubs_addOne',
		description: 'Adds one club'
	})
	@UseFilters(BusinessExceptionFilter)
	@UseGuards(AuthAccessGuard)
	@Transactional()
	public async addClub(
		@AccessCtx() accessContext: AccessContext,
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
	@Transactional()
	public async editClub(
		@AccessCtx() accessContext: AccessContext,
		@Args('id', { description: 'The id of the club' }) id: string,
		@Args('name', { description: 'The name of the club' }) name: string
	): Promise<ClubDTO> {
		const club = await this.clubManager.getClubById(accessContext, id);
		return this.clubManager.editClub(accessContext, club, name);
	}

	@Mutation(_ => GraphQLBoolean, {
		name: 'clubs_deleteOne',
		description: 'Deletes one club'
	})
	@UseFilters(BusinessExceptionFilter)
	@UseGuards(AuthAccessGuard)
	public async deleteClub(
		@AccessCtx() accessContext: AccessContext,
		@Args('id', { description: 'The id of the club' }) id: string
	): Promise<boolean> {
		const club = await this.clubManager.getClubById(accessContext, id);
		await this.clubManager.deleteClub(accessContext, club);
		return true;
	}

	@ResolveField(nameof<ClubDTO>('clubMemberships'), _ => PaginatedMembershipDTO)
	@UseFilters(BusinessExceptionFilter)
	@UseGuards(AuthAccessGuard)
	@Transactional()
	public async getUserMemberships(
		@AccessCtx() accessContext: AccessContext,
		@Parent() clubDTO: ClubDTO,
		@PageSize() pageSize: number,
		@Offset() offset: number,
		@Args('searchForName', {
			description: 'The name of members to search for', nullable: true
		}) searchForName?: string
	): Promise<PaginatedMembershipDTO> {
		const club = await this.clubManager.getClubById(accessContext, clubDTO.id);
		const { memberships, count } = await this.clubManager.getAllClubMembershipsPaginated(
			accessContext, club, pageSize, offset, searchForName
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