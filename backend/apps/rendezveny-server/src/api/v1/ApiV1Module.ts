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
import { OrganizerResolver } from './resolvers/OrganizerResolver';
import { LogResolver } from './resolvers/LogResolver';
import { ConfigModule, ConfigService } from '@nestjs/config';

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
		RegistrationResolver,
		OrganizerResolver,
		LogResolver
	]
})
export class ApiV1Module {
	public static forRoot(): DynamicModule[] {
		return [
			GraphQLModule.forRootAsync({
				imports: [ConfigModule],
				inject: [ConfigService],
				useFactory: async(configService: ConfigService) => ({
					debug: configService.get<boolean>('debug'),
					playground: configService.get<boolean>('debug'),
					path: '/api/v1',

					cors: configService.get<boolean>('debug') === false
						? false
						: {
							origin: configService.get('security.domain'),
							methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
							allowedHeaders: ['Content-Type', 'Authorization'],
							credentials: true,
							preflightContinue: false
						},

					context: ({ req }) => ({ req }),
					fieldResolverEnhancers: ['guards'],

					autoSchemaFile: join(process.cwd(), 'apps/rendezveny-server/src/api/v1/schema.gql'),
					sortSchema: true
				})
			})
		];
	}
}