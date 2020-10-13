import { Module } from '@nestjs/common';
import { SeedService } from './SeedService';
import { DataModule } from '../DataModule';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
	imports: [
		TypeOrmModule.forRootAsync({
			useFactory: async() => {
				const ormconfig = await import('../../../ormconfig');
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
		DataModule
	],
	providers: [
		SeedService
	]
})
export class SeedModule {}