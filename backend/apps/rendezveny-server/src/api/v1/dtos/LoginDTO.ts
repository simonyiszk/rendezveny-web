import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType({
	description: 'The login response'
})
export class LoginDTO {
	@Field({
		description: 'The refresh token'
	})
	public refresh: string = '';

	@Field({
		description: 'The access token'
	})
	public access: string = '';
}