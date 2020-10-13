/* eslint-disable max-classes-per-file */
import { Field, ObjectType } from '@nestjs/graphql';
import { PaginatedDTO } from '../utils/PaginatedDTO';
import { PaginatedMembershipDTO } from './MembershipDTO';

@ObjectType({
	description: 'The data of a user'
})
export class UserDTO {
	@Field({
		description: 'The id of a user'
	})
	public id: string = '';

	@Field({
		description: 'The name of the user'
	})
	public name: string = '';

	@Field(_ => PaginatedMembershipDTO, {
		description: 'The club memberships of the user'
	})
	public clubMemberships?: PaginatedMembershipDTO;
}

@ObjectType({
	description: 'Paginated data of users'
})
export class PaginatedUserDTO extends PaginatedDTO(UserDTO) {}