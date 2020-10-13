import { Args, Int, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { ClubDTO, PaginatedClubDTO } from '../dtos/ClubDTO';
import { nameof } from '../../../utils/nameof';
import { PaginatedMembershipDTO } from '../dtos/MembershipDTO';
import { ClubManager } from '../../../business/clubs/ClubManager';
import { UseFilters } from '@nestjs/common';
import { BusinessExceptionFilter } from '../utils/BusinessExceptionFilter';
import { GraphQLBoolean } from 'graphql';

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
	public async getClubs(
		@Args('pageSize', {
			description: 'The size of the page',
			type: () => Int,
			defaultValue: -1
		}) pageSize: number,
		@Args('offset', {
			description: 'The offset of the page',
			type: () => Int,
			defaultValue: -1
		}) offset: number,
	): Promise<PaginatedClubDTO> {
		const { clubs, count }
			= (pageSize === -1 && offset === -1)
			? await this.clubManager.getAllClubs()
			: await this.clubManager.getAllClubsPaginated(pageSize, offset);

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
	public async getClub(
		@Args('id', { description: 'The id of the club' }) id: string
	): Promise<ClubDTO> {
		return this.clubManager.getClub(id);
	}

	@Mutation(_ => ClubDTO, {
		name: 'clubs_addOne',
		description: 'Adds one club'
	})
	@UseFilters(BusinessExceptionFilter)
	public async addClub(
		@Args('name', { description: 'The name of the club' }) name: string
	): Promise<ClubDTO> {
		return this.clubManager.addClub(name);
	}

	@Mutation(_ => ClubDTO, {
		name: 'clubs_editOne',
		description: 'Edits one club'
	})
	@UseFilters(BusinessExceptionFilter)
	public async editClub(
		@Args('id', { description: 'The id of the club' }) id: string,
		@Args('name', { description: 'The name of the club' }) name: string
	): Promise<ClubDTO> {
		return this.clubManager.editClub(id, name);
	}

	@Mutation(_ => GraphQLBoolean, {
		name: 'clubs_deleteOne',
		description: 'Deletes one club'
	})
	@UseFilters(BusinessExceptionFilter)
	public async deleteClub(
		@Args('id', { description: 'The id of the club' }) id: string
	): Promise<boolean> {
		await this.clubManager.deleteClub(id);
		return true;
	}

	@ResolveField(nameof<ClubDTO>('clubMemberships'), _ => PaginatedMembershipDTO)
	public async getUserMemberships(
		@Parent() _club: ClubDTO,
		@Args('pageSize', {
			description: 'The size of the page',
			type: () => Int,
			defaultValue: -1
		}) _pageSize: number,
		@Args('offset', {
			description: 'The offset of the page',
			type: () => Int,
			defaultValue: -1
		}) _offset: number,
	): Promise<PaginatedMembershipDTO> {
		return {
			nodes: [],
			totalCount: 0
		};
	}
}