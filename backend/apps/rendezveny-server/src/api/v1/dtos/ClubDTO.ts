/* eslint-disable max-classes-per-file */
import { Field, ObjectType } from '@nestjs/graphql';
import { PaginatedDTO } from '../utils/PaginatedDTO';
import { PaginatedMembershipDTO } from './MembershipDTO';

@ObjectType({
	description: 'The data of a club'
})
export class ClubDTO {
	@Field({
		description: 'The id of a club'
	})
	public id: string = '';

	@Field({
		description: 'The name of the club'
	})
	public name: string = '';

	@Field({
		description: 'The SCH id of the club'
	})
	public externalId: number = 0;

	@Field((_) => PaginatedMembershipDTO, {
		description: 'The club memberships of the club'
	})
	public clubMemberships?: PaginatedMembershipDTO;
}

@ObjectType({
	description: 'Paginated data of clubs'
})
export class PaginatedClubDTO extends PaginatedDTO(ClubDTO) {}
