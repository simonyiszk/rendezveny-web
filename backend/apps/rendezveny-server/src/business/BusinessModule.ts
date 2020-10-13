import { Module } from '@nestjs/common';
import { ClubManager } from './clubs/ClubManager';
import { DataModule } from '../data/DataModule';

@Module({
	imports: [
		DataModule
	],
	providers: [
		ClubManager
	],
	exports: [
		ClubManager
	]
})
export class BusinessModule {}