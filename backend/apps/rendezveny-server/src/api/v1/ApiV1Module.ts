import { DynamicModule, Module } from '@nestjs/common';
import { UsersResolver } from './resolvers/UsersResolver';
import { ClubsResolver } from './resolvers/ClubsResolver';
import { BusinessModule } from '../../business/BusinessModule';
import { MembershipResolver } from './resolvers/MembershipResolver';
import { LoginResolver } from './resolvers/LoginResolver';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'path';
import { EventResolver } from './resolvers/EventResolver';
import { RegistrationResolver } from './resolvers/RegistrationResolver';

@Module({
	imports: [
		BusinessModule
	],
	providers: [
		UsersResolver,
		ClubsResolver,
		MembershipResolver,
		LoginResolver,
		EventResolver,
		RegistrationResolver
	]
})
export class ApiV1Module {
	public static forRoot(): DynamicModule[] {
		return [
			GraphQLModule.forRoot({
				debug: true,
				playground: true,
				path: '/api/v1',

				context: ({ req }) => ({ req }),
				fieldResolverEnhancers: ['guards'],

				autoSchemaFile: join(process.cwd(), 'apps/rendezveny-server/src/api/v1/schema.gql'),
				sortSchema: true
			})
		];
	}
}