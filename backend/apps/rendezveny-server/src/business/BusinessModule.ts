import { Module } from '@nestjs/common';
import { ClubManager } from './clubs/ClubManager';
import { DataModule } from '../data/DataModule';
import { CryptoService } from './crypto/CryptoService';
import { UserManager } from './users/UserManager';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthManager } from './auth/AuthManager';
import { AuthRefreshJwtStrategy } from './auth/passport/AuthRefreshJwtStrategy';
import { AuthAccessJwtStrategy } from './auth/passport/AuthAccessJwtStrategy';
import { EventManager } from './events/EventManager';
import { AuthEventJwtStrategy } from './auth/passport/AuthEventJwtStrategy';
import { RegistrationManager } from './registration/RegistrationManager';
import { FormManager } from './registration/FormManager';
import { FormTemplateManager } from './registration/FormTemplateManager';

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
		EventManager,
		RegistrationManager,
		FormManager,
		FormTemplateManager,
		AuthManager,
		AuthRefreshJwtStrategy,
		AuthAccessJwtStrategy,
		AuthEventJwtStrategy,
		CryptoService
	],
	exports: [
		ClubManager,
		UserManager,
		EventManager,
		RegistrationManager,
		FormManager,
		FormTemplateManager,
		AuthManager
	]
})
export class BusinessModule {}