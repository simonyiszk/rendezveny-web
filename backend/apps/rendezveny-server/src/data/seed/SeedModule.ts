import { Module } from '@nestjs/common';
import { SeedService } from './SeedService';
import { DataModule } from '../DataModule';
import { BusinessModule } from '../../business/BusinessModule';
import { JwtModule } from '@nestjs/jwt';

@Module({
	imports: [
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