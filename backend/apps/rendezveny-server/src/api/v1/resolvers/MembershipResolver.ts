import { Resolver } from '@nestjs/graphql';
import { ClubRole as ClubRoleDTO, MembershipDTO } from '../dtos/MembershipDTO';
import { ClubRole } from '../../../data/models/ClubRole';

@Resolver((_: never) => MembershipDTO)
export class MembershipResolver {
	public static transformClubRole(role: ClubRole): ClubRoleDTO {
		switch(role) {
			case ClubRole.MEMBER:
				return ClubRoleDTO.MEMBER;
			case ClubRole.CLUB_MANAGER:
				return ClubRoleDTO.CLUB_MANAGER;
		}
	}
}