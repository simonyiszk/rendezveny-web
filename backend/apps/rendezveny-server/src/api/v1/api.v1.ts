import { Module } from '@nestjs/common';
import { UsersResolver } from './resolvers/UsersResolver';
import { ClubsResolver } from './resolvers/ClubsResolver';
import { BusinessModule } from '../../business/BusinessModule';

@Module({
	imports: [
		BusinessModule
	],
	providers: [
		UsersResolver,
		ClubsResolver
	]
})
export class ApiV1Module {}