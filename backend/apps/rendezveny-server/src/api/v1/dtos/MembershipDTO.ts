/* eslint-disable max-classes-per-file */
import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { ClubDTO } from './ClubDTO';
import { UserDTO } from './UserDTO';
import { PaginatedDTO } from '../utils/PaginatedDTO';

@ObjectType({
	description: 'The data of a club membership'
})
export class MembershipDTO {
	@Field((_) => ClubDTO, {
		description: 'The club the user belongs to'
	})
	public club!: ClubDTO;

	@Field((_) => UserDTO, {
		description: 'The user that belongs to the club'
	})
	public user!: UserDTO;

	@Field((_) => ClubRole, {
		description: 'The role of the user in the club'
	})
	public role!: ClubRole;
}

@ObjectType({
	description: 'The paginated data of club memberships'
})
export class PaginatedMembershipDTO extends PaginatedDTO(MembershipDTO) {}

export enum ClubRole {
	MEMBER,
	CLUB_MANAGER
}

registerEnumType(ClubRole, {
	name: 'ClubRole',
	description: 'Describes the role of a club member in a club'
});
