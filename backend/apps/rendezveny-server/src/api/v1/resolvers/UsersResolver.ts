import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { PaginatedUserDTO, UserDTO } from '../dtos/UserDTO';
import { PaginatedMembershipDTO } from '../dtos/MembershipDTO';
import { nameof } from '../../../utils/nameof';
import { Offset, PageSize } from '../utils/PaginatedDTO';
import { UserManager } from '../../../business/users/UserManager';
import { MembershipResolver } from './MembershipResolver';
import { LocalIdentityDTO } from '../dtos/LocalIdentityDTO';
import { AccessContext } from '../../../business/auth/passport/AuthAccessJwtStrategy';
import { AccessToken } from '../../../business/auth/AuthTokens';

@Resolver((_: never) => UserDTO)
export class UsersResolver {
	public constructor(
		private readonly userManager: UserManager
	) {}

	@Query(_ => PaginatedUserDTO, {
		name: 'users_getAll',
		description: 'Gets the users in the system'
	})
	public async getUsers(
		@AccessContext() accessContext: AccessToken,
		@PageSize() pageSize: number,
		@Offset() offset: number
	): Promise<PaginatedUserDTO> {
		const { users, count } = await this.userManager.getAllUsersPaginated(accessContext, pageSize, offset);

		return {
			nodes: users,
			totalCount: count,
			pageSize: pageSize,
			offset: offset
		};
	}

	@Query(_ => UserDTO, {
		name: 'users_getOne',
		description: 'Gets one user based on its id'
	})
	public async getUser(
		@AccessContext() accessContext: AccessToken,
		@Args('id', { description: 'The id of the user' }) id: string
	): Promise<UserDTO> {
		return this.userManager.getUser(accessContext, id);
	}

	@ResolveField(nameof<UserDTO>('clubMemberships'), _ => PaginatedMembershipDTO)
	public async getUserMemberships(
		@AccessContext() accessContext: AccessToken,
		@Parent() user: UserDTO,
		@PageSize() pageSize: number,
		@Offset() offset: number
	): Promise<PaginatedMembershipDTO> {
		const { memberships, count } = await this.userManager.getAllClubMembershipsPaginated(
			accessContext, user.id, pageSize, offset
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

	@ResolveField(nameof<UserDTO>('localIdentity'), _ => LocalIdentityDTO, { nullable: true })
	public async getLocalIdentity(
		@AccessContext() accessContext: AccessToken,
		@Parent() user: UserDTO
	): Promise<LocalIdentityDTO | null> {
		return this.userManager.getLocalIdentity(accessContext, user.id);
	}
}