import { HttpService, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { checkArgument } from '../../utils/preconditions';
import { isNotEmpty } from 'class-validator';
import { AuthUserNameValidationException } from './exceptions/AuthUserNameValidationException';
import { AuthPasswordValidationException } from './exceptions/AuthPasswordValidationException';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../data/models/User';
import { LocalIdentity } from '../../data/models/LocalIdentity';
import { nameof } from '../../utils/nameof';
import { ClubMembership } from '../../data/models/ClubMembership';
import { CryptoService } from '../crypto/CryptoService';
import { AuthInvalidUsernameOrPasswordException } from './exceptions/AuthInvalidUsernameOrPasswordException';
import { AuthInvalidTokenException } from './exceptions/AuthInvalidTokenException';
import { RefreshToken as RefreshTokenEntity } from '../../data/models/RefreshToken';
import { AuthUserSuspendedException } from './exceptions/AuthUserSuspendedException';
import { RefreshContext, RefreshToken } from './tokens/RefreshToken';
import { AccessToken } from './tokens/AccessToken';
import {
	AuthSCHIdentityRepository,
	ClubMembershipRepository,
	ClubRepository,
	LocalIdentityRepository,
	RefreshTokenRepository,
	UserRepository
} from '../../data/repositories/repositories';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { ConfigService } from '@nestjs/config';
import { AuthSCHIdentity } from '../../data/models/AuthSCHIdentity';
import { UserRole } from '../../data/models/UserRole';
import { ClubRole } from '../../data/models/ClubRole';
import { AuthInvalidAuthorizationCodeException } from './exceptions/AuthInvalidAuthorizationCodeException';

@Injectable()
export class AuthManager {
	public constructor(
		@InjectRepository(UserRepository) private readonly userRepository: UserRepository,
		@InjectRepository(LocalIdentityRepository) private readonly localIdentityRepository: LocalIdentityRepository,
		@InjectRepository(AuthSCHIdentity) private readonly authSCHIdentityRepository: AuthSCHIdentityRepository,
		@InjectRepository(RefreshTokenRepository) private readonly refreshTokenRepository: RefreshTokenRepository,
		@InjectRepository(ClubRepository) private readonly clubRepository: ClubRepository,
		@InjectRepository(ClubMembershipRepository) private readonly clubMembershipRepository: ClubMembershipRepository,
		private readonly jwtService: JwtService,
		private readonly cryptoService: CryptoService,
		private readonly httpService: HttpService,
		private readonly configService: ConfigService
	) {}

	@Transactional()
	public async loginWithLocalIdentity(
		username: string,
		password: string
	): Promise<{ refresh: string; access: string; user: User }> {
		checkArgument(isNotEmpty(username), AuthUserNameValidationException);
		checkArgument(isNotEmpty(password), AuthPasswordValidationException);

		const localIdentity = await this.localIdentityRepository.findOne(
			{ username },
			{
				relations: [nameof<LocalIdentity>('user')]
			}
		);

		if (localIdentity) {
			const { hashedPassword } = await this.cryptoService.hashPassword(
				password,
				localIdentity.passwordVersion,
				localIdentity.salt
			);

			if (localIdentity.user.isSuspended) {
				throw new AuthUserSuspendedException();
			} else if (localIdentity.password === hashedPassword) {
				return this.returnTokens(localIdentity.user);
			}
		}

		throw new AuthInvalidUsernameOrPasswordException();
	}

	@Transactional()
	public async loginWithAuthSCHIdentity(
		authorizationCode: string
	): Promise<{ refresh: string; access: string; user: User }> {
		const accessToken = await this.getAccessToken(authorizationCode);
		const { internalId, displayName, email, userClubMemberships } = await this.getAuthSCHProfile(accessToken);

		const authSCHIdentity = await this.authSCHIdentityRepository.findOne({ externalId: internalId });

		let user: User;
		if (authSCHIdentity) {
			// eslint-disable-next-line prefer-destructuring
			user = authSCHIdentity.user;
			if (user.isSuspended) {
				throw new AuthUserSuspendedException();
			}

			authSCHIdentity.email = email;
			await this.authSCHIdentityRepository.save(authSCHIdentity);

			user.name = displayName;
			await this.userRepository.save(user);
		} else {
			const newAuthSCHIdentity = new AuthSCHIdentity({
				externalId: internalId,
				email: email
			});
			await this.authSCHIdentityRepository.save(newAuthSCHIdentity);

			user = new User({
				name: displayName,
				role: UserRole.USER,
				isSuspended: false,
				authSCHIdentity: newAuthSCHIdentity
			});
			await this.userRepository.save(user);
		}
		await user.loadRelation(this.userRepository, 'memberships');

		await this.clubMembershipRepository.delete({ user });
		const clubs = await this.clubRepository.find();
		const newClubMemberships: ClubMembership[] = [];
		for (const userClubMembership of userClubMemberships) {
			const clubId = userClubMembership.id as number;
			const club = clubs.find((c) => c.externalId === clubId);
			if (club) {
				if (userClubMembership.title?.includes('körvezető') === true) {
					newClubMemberships.push(
						new ClubMembership({
							user: user,
							club: club,
							clubRole: ClubRole.CLUB_MANAGER
						})
					);
				} else {
					newClubMemberships.push(
						new ClubMembership({
							user: user,
							club: club,
							clubRole: ClubRole.MEMBER
						})
					);
				}
			}
		}
		await this.clubMembershipRepository.save(newClubMemberships);

		return this.returnTokens(user);
	}

	@Transactional()
	public async loginWithRefreshToken(refreshContext: RefreshContext): Promise<{ access: string; user: User }> {
		const token = await this.refreshTokenRepository.findOne({ id: refreshContext.getTokenId() });
		if (!token || token.user.id !== refreshContext.getUserId()) {
			throw new AuthInvalidTokenException();
		}

		const user = await this.userRepository.findOne(
			{ id: refreshContext.getUserId() },
			{
				relations: [
					`${nameof<User>('memberships')}`,
					`${nameof<User>('memberships')}.${nameof<ClubMembership>('club')}`
				]
			}
		);

		if (user) {
			if (user.isSuspended) {
				throw new AuthUserSuspendedException();
			} else {
				return {
					access: await this.jwtService.signAsync(
						{
							typ: 'access',
							uid: user.id,
							rol: user.role,
							clb: user.memberships.map((m) => ({
								cid: m.club.id,
								rol: m.clubRole
							}))
						} as AccessToken,
						{
							expiresIn: this.configService.get('token.accessValidity')
						}
					),
					user: user
				};
			}
		}

		throw new AuthInvalidTokenException();
	}

	@Transactional()
	public async logout(refreshContext: RefreshContext): Promise<void> {
		await this.refreshTokenRepository.delete({ id: refreshContext.getTokenId() });
	}

	private async returnTokens(user: User): Promise<{ refresh: string; access: string; user: User }> {
		const tokenEntity = await this.refreshTokenRepository.save(new RefreshTokenEntity({ user }));

		const refreshPayload = {
			typ: 'refresh',
			tid: tokenEntity.id,
			uid: user.id
		} as RefreshToken;

		const refreshToken = await this.jwtService.signAsync(refreshPayload, {
			expiresIn: this.configService.get('token.refreshValidity')
		});

		return {
			refresh: refreshToken,
			...(await this.loginWithRefreshToken(new RefreshContext(refreshPayload)))
		};
	}

	private async getAccessToken(authorizationCode: string): Promise<string> {
		try {
			const tokenResponse = await this.httpService
				.post(
					'https://auth.sch.bme.hu/oauth2/token',
					`grant_type=authorization_code&code=${authorizationCode}`,
					{
						auth: {
							username: this.configService.get('authsch.clientId')!,
							password: this.configService.get('authsch.secretKey')!
						}
					}
				)
				.toPromise();

			if (typeof tokenResponse.data.access_token === 'string') {
				return tokenResponse.data.access_token;
			}
		} catch (_) {
			throw new AuthInvalidAuthorizationCodeException();
		}
		throw new AuthInvalidAuthorizationCodeException();
	}

	private async getAuthSCHProfile(
		accessToken: string
	): Promise<{
		internalId: string;
		displayName: string;
		email: string;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		userClubMemberships: any[];
	}> {
		try {
			const profileInfo = await this.httpService
				.get(`https://auth.sch.bme.hu/api/profile/?access_token=${accessToken}`)
				.toPromise();

			if (
				typeof profileInfo.data.internal_id === 'string' &&
				typeof profileInfo.data.displayName === 'string' &&
				typeof profileInfo.data.mail === 'string' &&
				Array.isArray(profileInfo.data.eduPersonEntitlement ?? [])
			) {
				return {
					internalId: profileInfo.data.internal_id,
					displayName: profileInfo.data.displayName,
					email: profileInfo.data.mail,
					userClubMemberships: profileInfo.data.eduPersonEntitlement ?? []
				};
			}
		} catch (_) {
			throw new AuthInvalidAuthorizationCodeException();
		}
		throw new AuthInvalidAuthorizationCodeException();
	}
}
