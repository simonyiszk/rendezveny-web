import { Module } from '@nestjs/common';
import { ClubManager } from './clubs/ClubManager';
import { DataModule } from '../data/DataModule';
import { CryptoService } from './crypto/CryptoService';
import { UserManager } from './users/UserManager';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthManager } from './auth/AuthManager';
import { AuthRefreshJwtStrategy } from './auth/AuthRefreshJwtStrategy';
import { AuthAccessJwtStrategy } from './auth/AuthAccessJwtStrategy';

@Module({
	imports: [
		DataModule,
		PassportModule,
		JwtModule.register({
			secret: 'rendezveny'
		})
	],
	providers: [
		ClubManager,
		UserManager,
		AuthManager,
		AuthRefreshJwtStrategy,
		AuthAccessJwtStrategy,
		CryptoService
	],
	exports: [
		ClubManager,
		UserManager,
		AuthManager
	]
})
export class BusinessModule {}