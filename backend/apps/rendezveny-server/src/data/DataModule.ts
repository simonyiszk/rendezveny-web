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
	OrganizerRepository,
	RefreshTokenRepository,
	RegistrationRepository,
	TagRepository,
	TemporaryIdentityRepository, UserRepository
} from './repositories/repositories';

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
				useFactory: async() => {
					const ormconfig = await import('../../ormconfig');
					return {
						type: ormconfig.type as 'mysql',
						host: ormconfig.host,
						port: ormconfig.port,
						username: ormconfig.username,
						password: ormconfig.password,
						database: ormconfig.database,

						autoLoadEntities: true,
						logging: ['warn', 'error', 'query']
					};
				}
			})
		];
	}
}