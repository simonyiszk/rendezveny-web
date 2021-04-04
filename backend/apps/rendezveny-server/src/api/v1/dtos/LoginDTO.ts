import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { MembershipDTO } from './MembershipDTO';

@ObjectType({
	description: 'The login response'
})
export class LoginDTO {
	@Field({
		description: 'The refresh token',
		nullable: true
	})
	public refresh?: string;

	@Field({
		description: 'The access token'
	})
	public access: string = '';

	@Field((_) => UserRole, {
		description: 'The role of the user'
	})
	public role!: UserRole;

	@Field((_) => [MembershipDTO], {
		description: 'The memberships of the user'
	})
	public memberships!: MembershipDTO[];
}

export enum UserRole {
	USER,
	ADMIN
}

registerEnumType(UserRole, {
	name: 'UserRole',
	description: 'Describes the system role of the user'
});
