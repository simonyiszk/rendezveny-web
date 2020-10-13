import { Args, Int, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { PaginatedUserDTO, UserDTO } from '../dtos/UserDTO';
import { PaginatedMembershipDTO } from '../dtos/MembershipDTO';
import { nameof } from '../../../utils/nameof';

@Resolver((_: never) => UserDTO)
export class UsersResolver {
	@Query(_ => PaginatedUserDTO, {
		name: 'users_getAll',
		description: 'Gets the users in the system'
	})
	public async getUsers(
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
	): Promise<PaginatedUserDTO> {
		return {
			nodes: [
				{ id: 'abcd', name: 'Földi Eper' },
				{ id: 'efgh', name: 'Figy Elek' }
			],

			totalCount: 2
		};
	}

	@Query(_ => UserDTO, {
		name: 'users_getOne',
		description: 'Gets one user based on its id'
	})
	public async getUser(
		@Args('id', { description: 'The id of the user' }) id: string
	): Promise<UserDTO> {
		return {
			id: id,
			name: 'Földi Eper'
		};
	}

	@ResolveField(nameof<UserDTO>('clubMemberships'), _ => PaginatedMembershipDTO)
	public async getUserMemberships(
		@Parent() _user: UserDTO,
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