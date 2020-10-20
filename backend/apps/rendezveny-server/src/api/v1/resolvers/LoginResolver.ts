import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { GraphQLBoolean, GraphQLString } from 'graphql';
import { AuthManager } from '../../../business/auth/AuthManager';
import { UseFilters, UseGuards } from '@nestjs/common';
import { BusinessExceptionFilter } from '../utils/BusinessExceptionFilter';
import { AuthRefreshGuard, RefreshCtx } from '../../../business/auth/passport/AuthRefreshJwtStrategy';
import { RefreshContext } from '../../../business/auth/AuthTokens';
import { LoginDTO } from '../dtos/LoginDTO';

@Resolver()
export class LoginResolver {
	public constructor(
		private readonly authManager: AuthManager
	) {}

	@Mutation(_ => LoginDTO, {
		name: 'login_withLocalIdentity',
		description: 'Logs the user in with username and password'
	})
	@UseFilters(BusinessExceptionFilter)
	public async loginWithLocalIdentity(
		@Args('username', { description: 'The username of the user' }) username: string,
		@Args('password', { description: 'The password of the user' }) password: string
	): Promise<LoginDTO> {
		return this.authManager.loginWithLocalIdentity(username, password);
	}

	@Mutation(_ => GraphQLString, {
		name: 'login_withRefreshToken',
		description: 'Logs the user in with a refresh token'
	})
	@UseFilters(BusinessExceptionFilter)
	@UseGuards(AuthRefreshGuard)
	public async loginWithRefreshToken(
		@RefreshCtx() refreshContext: RefreshContext
	): Promise<string> {
		return this.authManager.loginWithRefreshToken(refreshContext);
	}

	@Mutation(_ => GraphQLBoolean, {
		name: 'login_logout',
		description: 'Logs the user out'
	})
	@UseFilters(BusinessExceptionFilter)
	@UseGuards(AuthRefreshGuard)
	public async logout(
		@RefreshCtx() refreshContext: RefreshContext
	): Promise<boolean> {
		await this.authManager.logout(refreshContext);
		return true;
	}
}