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
	LocalIdentityRepository, LogRepository,
	OrganizerRepository,
	RefreshTokenRepository,
	RegistrationRepository,
	TagRepository,
	TemporaryIdentityRepository, UserRepository
} from './repositories/repositories';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
	imports: [
		TypeOrmModule.forFeature([
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
	providers: [
	],
	exports: [
		TypeOrmModule
	]
})
export class DataModule {
	public static forRoot(): DynamicModule[] {
		return [
			TypeOrmModule.forRootAsync({
				imports: [ConfigModule],
				inject: [ConfigService],
				useFactory: async(configService: ConfigService) => ({
						type: 'mysql',
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