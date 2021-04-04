import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { GraphQLBoolean, GraphQLString } from 'graphql';
import { AuthManager } from '../../../business/auth/AuthManager';
import { UseFilters, UseGuards, UseInterceptors } from '@nestjs/common';
import { BusinessExceptionFilter } from '../utils/BusinessExceptionFilter';
import { AuthRefreshGuard, RefreshCtx } from '../../../business/auth/passport/AuthRefreshJwtStrategy';
import { LoginDTO, UserRole as UserRoleDTO } from '../dtos/LoginDTO';
import { RefreshContext } from '../../../business/auth/tokens/RefreshToken';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { UserRole } from '../../../data/models/UserRole';
import { MembershipResolver } from './MembershipResolver';
import { LoggingInterceptor } from '../../../business/log/LoggingInterceptor';

@Resolver()
@UseInterceptors(LoggingInterceptor)
export class LoginResolver {
	public constructor(private readonly authManager: AuthManager) {}

	@Mutation((_) => LoginDTO, {
		name: 'login_withLocalIdentity',
		description: 'Logs the user in with username and password'
	})
	@UseFilters(BusinessExceptionFilter)
	@Transactional()
	public async loginWithLocalIdentity(
		@Args('username', { description: 'The username of the user' }) username: string,
		@Args('password', { description: 'The password of the user' }) password: string
	): Promise<LoginDTO> {
		const { access, refresh, user } = await this.authManager.loginWithLocalIdentity(username, password);
		return {
			access: access,
			refresh: refresh,
			role: LoginResolver.transformUserRule(user.role),
			memberships: user.memberships.map((membership) => ({
				club: membership.club,
				user: membership.user,
				role: MembershipResolver.transformClubRole(membership.clubRole)
			}))
		};
	}

	@Mutation((_) => LoginDTO, {
		name: 'login_withAuthSCHIdentity',
		description: 'Logs the user in with AuthSCH'
	})
	@UseFilters(BusinessExceptionFilter)
	@Transactional()
	public async loginWithAuthSCHIdentity(
		@Args('authorizationCode', {
			description: 'The Oauth2 authorization code'
		})
		authorizationCode: string
	): Promise<LoginDTO> {
		const { access, refresh, user } = await this.authManager.loginWithAuthSCHIdentity(authorizationCode);
		return {
			access: access,
			refresh: refresh,
			role: LoginResolver.transformUserRule(user.role),
			memberships: user.memberships.map((membership) => ({
				club: membership.club,
				user: membership.user,
				role: MembershipResolver.transformClubRole(membership.clubRole)
			}))
		};
	}

	@Mutation((_) => GraphQLString, {
		name: 'login_withRefreshToken',
		description: 'Logs the user in with a refresh token'
	})
	@UseFilters(BusinessExceptionFilter)
	@UseGuards(AuthRefreshGuard)
	@Transactional()
	public async loginWithRefreshToken(@RefreshCtx() refreshContext: RefreshContext): Promise<LoginDTO> {
		const { access, user } = await this.authManager.loginWithRefreshToken(refreshContext);
		return {
			access: access,
			role: LoginResolver.transformUserRule(user.role),
			memberships: user.memberships.map((membership) => ({
				club: membership.club,
				user: membership.user,
				role: MembershipResolver.transformClubRole(membership.clubRole)
			}))
		};
	}

	@Mutation((_) => GraphQLBoolean, {
		name: 'login_logout',
		description: 'Logs the user out'
	})
	@UseFilters(BusinessExceptionFilter)
	@UseGuards(AuthRefreshGuard)
	@Transactional()
	public async logout(@RefreshCtx() refreshContext: RefreshContext): Promise<boolean> {
		await this.authManager.logout(refreshContext);
		return true;
	}

	public static transformUserRule(role: UserRole): UserRoleDTO {
		switch (role) {
			case UserRole.USER:
				return UserRoleDTO.USER;
			case UserRole.ADMIN:
				return UserRoleDTO.ADMIN;
		}
	}
}
