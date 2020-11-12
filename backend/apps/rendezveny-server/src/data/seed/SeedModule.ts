import { Module } from '@nestjs/common';
import { SeedService } from './SeedService';
import { DataModule } from '../DataModule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BusinessModule } from '../../business/BusinessModule';
import { JwtModule } from '@nestjs/jwt';

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
		DataModule,
		BusinessModule,
		JwtModule.register({})
	],
	providers: [
		SeedService
	]
})
export class SeedModule {}