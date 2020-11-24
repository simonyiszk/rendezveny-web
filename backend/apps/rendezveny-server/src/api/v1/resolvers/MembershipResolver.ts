import { Resolver } from '@nestjs/graphql';
import { ClubRole as ClubRoleDTO, MembershipDTO } from '../dtos/MembershipDTO';
import { ClubRole } from '../../../data/models/ClubRole';
import { UseInterceptors } from '@nestjs/common';
import { LoggingInterceptor } from '../../../business/log/LoggingInterceptor';

@Resolver((_: never) => MembershipDTO)
@UseInterceptors(LoggingInterceptor)
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