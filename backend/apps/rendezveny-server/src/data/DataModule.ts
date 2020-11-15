import { DynamicModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './models/User';
import { LocalIdentity } from './models/LocalIdentity';
import { Club } from './models/Club';
import { ClubMembership } from './models/ClubMembership';
import { RefreshToken } from './models/RefreshToken';
import { Event } from './models/Event';
import { Organizer } from './models/Organizer';
import { Registration } from './models/Registration';
import { Tag } from './models/Tag';
import { TemporaryIdentity } from './models/TemporaryIdentity';
import { FormQuestion } from './models/FormQuestion';
import { FormQuestionAnswer } from './models/FormQuestionAnswer';
import { FormQuestionTemplate } from './models/FormQuestionTemplate';
import { HRSegment } from './models/HRSegment';
import { HRTable } from './models/HRTable';
import { HRTask } from './models/HRTask';

@Module({
	imports: [
		TypeOrmModule.forFeature([
			Club,
			ClubMembership,
			Event,
			FormQuestion,
			FormQuestionAnswer,
			FormQuestionTemplate,
			HRSegment,
			HRTable,
			HRTask,
			LocalIdentity,
			Organizer,
			RefreshToken,
			Registration,
			Tag,
			TemporaryIdentity,
			User
		])
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