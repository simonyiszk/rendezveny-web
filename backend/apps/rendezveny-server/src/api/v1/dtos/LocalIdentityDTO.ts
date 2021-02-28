import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType({
	description: 'The local identity of a user'
})
export class LocalIdentityDTO {
	@Field({
		description: 'The username of a user'
	})
	public username: string = '';

	@Field({
		description: 'The email of a user'
	})
	public email: string = '';
}
