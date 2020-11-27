import { Module } from '@nestjs/common';
import { SeedService } from './SeedService';
import { DataModule } from '../DataModule';
import { BusinessModule } from '../../business/BusinessModule';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import config from '../../config/config';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			load: [config]
		}),
		...DataModule.forRoot(),
		DataModule,
		BusinessModule,
		JwtModule.register({})
	],
	providers: [
		SeedService
	]
})
export class SeedModule {}