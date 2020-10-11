import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType({
	description: 'The data of a user'
})
export class UserDTO {
	@Field({
		description: 'The id of a user'
	})
	public id: string;

	@Field({
		description: 'The name of the user'
	})
	public name: string;
}