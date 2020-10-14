import { DynamicModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './models/User';
import { LocalIdentity } from './models/LocalIdentity';
import { Club } from './models/Club';
import { ClubMembership } from './models/ClubMembership';
import { RefreshToken } from './models/RefreshToken';

@Module({
	imports: [
		TypeOrmModule.forFeature([
			User, LocalIdentity, Club, ClubMembership, RefreshToken
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