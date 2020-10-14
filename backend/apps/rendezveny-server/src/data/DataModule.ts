import { Module } from '@nestjs/common';
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
export class DataModule {}