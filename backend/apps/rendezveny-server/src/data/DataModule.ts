import { DynamicModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
	ClubMembershipRepository,
	ClubRepository,
	EventRepository,
	FormQuestionAnswerRepository,
	FormQuestionRepository,
	FormQuestionTemplateRepository,
	HRSegmentRepository,
	HRTableRepository,
	HRTaskRepository,
	LocalIdentityRepository,
	LogRepository,
	OrganizerRepository,
	RefreshTokenRepository,
	RegistrationRepository,
	TagRepository,
	TemporaryIdentityRepository,
	UserRepository
} from './repositories/repositories';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthSCHIdentity } from './models/AuthSCHIdentity';

@Module({
	imports: [
		TypeOrmModule.forFeature([
			AuthSCHIdentity,
			ClubRepository,
			ClubMembershipRepository,
			EventRepository,
			FormQuestionRepository,
			FormQuestionAnswerRepository,
			FormQuestionTemplateRepository,
			HRSegmentRepository,
			HRTableRepository,
			HRTaskRepository,
			LocalIdentityRepository,
			LogRepository,
			OrganizerRepository,
			RefreshTokenRepository,
			RegistrationRepository,
			TagRepository,
			TemporaryIdentityRepository,
			UserRepository
		])
	],
	providers: [],
	exports: [TypeOrmModule]
})
export class DataModule {
	public static forRoot(): DynamicModule[] {
		return [
			TypeOrmModule.forRootAsync({
				imports: [ConfigModule],
				inject: [ConfigService],
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				useFactory: async (configService: ConfigService) => ({
					type: configService.get('type'),
					host: configService.get('database.host'),
					port: configService.get('database.port'),
					username: configService.get('database.username'),
					password: configService.get('database.password'),
					database: configService.get('database.database'),

					autoLoadEntities: true,
					logging: ['warn', 'error']
				})
			})
		];
	}
}
