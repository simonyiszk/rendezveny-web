import { DynamicModule, HttpModule, Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
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
import { OrganizerManager } from './organizing/OrganizerManager';
import { HRTableManager } from './organizing/HRTableManager';
import { LoggingInterceptor } from './log/LoggingInterceptor';
import { LogManager } from './log/LogManager';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
	imports: [
		DataModule,
		PassportModule,
		JwtModule.registerAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: async (configService: ConfigService) => ({
				secret: configService.get('token.secret')
			})
		}),
		HttpModule.register({
			timeout: 5000
		})
	],
	providers: [
		ClubManager,
		UserManager,
		EventManager,
		RegistrationManager,
		FormManager,
		FormTemplateManager,
		OrganizerManager,
		HRTableManager,
		LogManager,
		LoggingInterceptor,
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
		OrganizerManager,
		HRTableManager,
		AuthManager,
		LogManager,
		LoggingInterceptor,
		CryptoService
	]
})
export class BusinessModule {
	public static forRoot(): DynamicModule[] {
		return [ScheduleModule.forRoot()];
	}
}
