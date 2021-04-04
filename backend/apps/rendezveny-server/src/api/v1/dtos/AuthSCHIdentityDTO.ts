import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType({
	description: 'The local identity of a user'
})
export class AuthSCHIdentityDTO {
	@Field({
		description: 'The email of a user'
	})
	public email: string = '';
}
