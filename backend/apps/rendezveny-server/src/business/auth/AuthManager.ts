import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { checkArgument } from '../../utils/preconditions';
import { isNotEmpty } from 'class-validator';
import { AuthUserNameValidationException } from './exceptions/AuthUserNameValidationException';
import { AuthPasswordValidationException } from './exceptions/AuthPasswordValidationException';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../data/models/User';
import { EntityManager, Repository, Transaction, TransactionManager } from 'typeorm';
import { LocalIdentity } from '../../data/models/LocalIdentity';
import { nameof } from '../../utils/nameof';
import { ClubMembership } from '../../data/models/ClubMembership';
import { CryptoService } from '../crypto/CryptoService';
import { AuthInvalidUsernameOrPasswordException } from './exceptions/AuthInvalidUsernameOrPasswordException';
import { AuthInvalidTokenException } from './exceptions/AuthInvalidTokenException';
import { AccessToken, RefreshToken } from './AuthTokens';
import { RefreshToken as RefreshTokenEntity } from '../../data/models/RefreshToken';
import { AuthUserSuspendedException } from './exceptions/AuthUserSuspendedException';

@Injectable()
export class AuthManager {
	public constructor(
		@InjectRepository(User) private readonly userRepository: Repository<User>,
		@InjectRepository(LocalIdentity) private readonly localIdentityRepository: Repository<LocalIdentity>,
		@InjectRepository(RefreshTokenEntity) private readonly refreshTokenRepository: Repository<RefreshTokenEntity>,
		private readonly jwtService: JwtService,
		private readonly cryptoService: CryptoService
	) {}

	@Transaction()
	public async loginWithLocalIdentity(
		username: string, password: string,
		@TransactionManager() _entityManager?: EntityManager
	): Promise<{ refresh: string, access: string }> {
		checkArgument(isNotEmpty(username), AuthUserNameValidationException);
		checkArgument(isNotEmpty(password), AuthPasswordValidationException);

		const localIdentity = await this.localIdentityRepository.findOne({ username }, {
			relations: [
				nameof<LocalIdentity>('user')
			]
		});

		if(localIdentity) {
			const { hashedPassword } = await this.cryptoService.hashPassword(
				password, localIdentity.passwordVersion, localIdentity.salt
			);

			if(localIdentity.user.isSuspended) {
				throw new AuthUserSuspendedException();
			}
			else if(localIdentity.password === hashedPassword) {
				const tokenEntity = await this.refreshTokenRepository.save(
					new RefreshTokenEntity({ user: localIdentity.user })
				);

				const refreshPayload = {
					typ: 'refresh',
					tid: tokenEntity.id,
					uid: localIdentity.user.id
				} as RefreshToken;

				const refreshToken = await this.jwtService.signAsync(refreshPayload, {
					expiresIn: '90d'
				});

				return {
					refresh: refreshToken,
					access: await this.loginWithRefreshToken(refreshPayload)
				};
			}
		}

		throw new AuthInvalidUsernameOrPasswordException();
	}

	public async loginWithRefreshToken(
		refreshContext: RefreshToken
	): Promise<string> {
		const token = await this.refreshTokenRepository.findOne({ id: refreshContext.tid });
		if(!token || token.user.id !== refreshContext.uid) {
			throw new AuthInvalidTokenException();
		}

		const user = await this.userRepository.findOne({ id: refreshContext.uid }, {
			relations: [
				`${nameof<User>('memberships')}`,
				`${nameof<User>('memberships')}.${nameof<ClubMembership>('club')}`
			]
		});

		if(user) {
			if(user.isSuspended) {
				throw new AuthUserSuspendedException();
			}
			else {
				return this.jwtService.signAsync({
					typ: 'access',
					uid: user.id,
					rol: user.role,
					clb: user.memberships.map(m => ({
						cid: m.club.id,
						rol: m.clubRole
					}))
				} as AccessToken, {
					expiresIn: '5m'
				});
			}
		}

		throw new AuthInvalidTokenException();
	}

	@Transaction()
	public async logout(
		refreshContext: RefreshToken,
		@TransactionManager() _entityManager?: EntityManager
	): Promise<void> {
		await this.refreshTokenRepository.delete({ id: refreshContext.tid });
	}
}