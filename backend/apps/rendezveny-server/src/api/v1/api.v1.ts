import { Module } from '@nestjs/common';
import { UsersResolver } from './users/UsersResolver';

@Module({
	providers: [
		UsersResolver
	]
})
export class ApiV1Module {}