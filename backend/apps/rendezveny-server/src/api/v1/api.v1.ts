import { Module } from '@nestjs/common';
import { UsersResolver } from './resolvers/UsersResolver';
import { ClubsResolver } from './resolvers/ClubsResolver';
import { BusinessModule } from '../../business/BusinessModule';
import { MembershipResolver } from './resolvers/MembershipResolver';
import { LoginResolver } from './resolvers/LoginResolver';

@Module({
	imports: [
		BusinessModule
	],
	providers: [
		UsersResolver,
		ClubsResolver,
		MembershipResolver,
		LoginResolver
	]
})
export class ApiV1Module {}