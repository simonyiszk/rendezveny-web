import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'path';
import { ApiV1Module } from './api/v1/api.v1';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataModule } from './data/DataModule';

@Module({
	imports: [
		GraphQLModule.forRoot({
			debug: true,
			playground: true,
			path: '/api/v1',

			autoSchemaFile: join(process.cwd(), 'apps/rendezveny-server/src/api/v1/schema.gql'),
			sortSchema: true
		}),
		TypeOrmModule.forRootAsync({
			useFactory: async() => {
				const ormconfig = await import('../ormconfig');
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
		}),
		ApiV1Module,
		DataModule
	]
})
export class AppModule {}
