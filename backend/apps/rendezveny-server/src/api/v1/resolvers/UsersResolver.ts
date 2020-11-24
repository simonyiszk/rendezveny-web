import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { PaginatedUserDTO, UserDTO } from '../dtos/UserDTO';
import { PaginatedMembershipDTO } from '../dtos/MembershipDTO';
import { nameof } from '../../../utils/nameof';
import { Offset, PageSize } from '../utils/PaginatedDTO';
import { UserManager } from '../../../business/users/UserManager';
import { MembershipResolver } from './MembershipResolver';
import { LocalIdentityDTO } from '../dtos/LocalIdentityDTO';
import { AccessCtx, AuthAccessGuard } from '../../../business/auth/passport/AuthAccessJwtStrategy';
import { AccessContext } from '../../../business/auth/tokens/AccessToken';
import { UseFilters, UseGuards, UseInterceptors } from '@nestjs/common';
import { BusinessExceptionFilter } from '../utils/BusinessExceptionFilter';
import { LoggingInterceptor } from '../../../business/log/LoggingInterceptor';

@Resolver((_: never) => UserDTO)
@UseInterceptors(LoggingInterceptor)
export class UsersResolver {
	public constructor(
		private readonly userManager: UserManager
	) {}

	@Query(_ => PaginatedUserDTO, {
		name: 'users_getAll',
		description: 'Gets the users in the system'
	})
	@UseFilters(BusinessExceptionFilter)
	@UseGuards(AuthAccessGuard)
	public async getUsers(
		@AccessCtx() accessContext: AccessContext,
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
	@UseFilters(BusinessExceptionFilter)
	@UseGuards(AuthAccessGuard)
	public async getUser(
		@AccessCtx() accessContext: AccessContext,
		@Args('id', { description: 'The id of the user' }) id: string
	): Promise<UserDTO> {
		return this.userManager.getUserById(accessContext, id);
	}

	@Query(_ => UserDTO, {
		name: 'users_getSelf',
		description: 'Gets the current user'
	})
	@UseFilters(BusinessExceptionFilter)
	@UseGuards(AuthAccessGuard)
	public async getSelf(
		@AccessCtx() accessContext: AccessContext
	): Promise<UserDTO> {
		return this.userManager.getUserById(accessContext, accessContext.getUserId());
	}

	@ResolveField(nameof<UserDTO>('clubMemberships'), _ => PaginatedMembershipDTO)
	@UseFilters(BusinessExceptionFilter)
	@UseGuards(AuthAccessGuard)
	public async getUserMemberships(
		@AccessCtx() accessContext: AccessContext,
		@Parent() userDTO: UserDTO,
		@PageSize() pageSize: number,
		@Offset() offset: number
	): Promise<PaginatedMembershipDTO> {
		const user = await this.userManager.getUserById(accessContext, userDTO.id);
		const { memberships, count } = await this.userManager.getAllClubMembershipsPaginated(
			accessContext, user, pageSize, offset
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
	@UseFilters(BusinessExceptionFilter)
	@UseGuards(AuthAccessGuard)
	public async getLocalIdentity(
		@AccessCtx() accessContext: AccessContext,
		@Parent() userDTO: UserDTO
	): Promise<LocalIdentityDTO | null> {
		const user = await this.userManager.getUserById(accessContext, userDTO.id);
		return this.userManager.getLocalIdentity(accessContext, user);
	}
}