import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './models/User';
import { LocalIdentity } from './models/LocalIdentity';
import { Club } from './models/Club';
import { ClubMembership } from './models/ClubMembership';

@Module({
	imports: [
		TypeOrmModule.forFeature([
			User, LocalIdentity, Club, ClubMembership
		])
	],
	exports: [
		TypeOrmModule
	]
})
export class DataModule {}