import { Club } from './Club';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { User } from './User';
import { ClubRole } from './ClubRole';
import { nameof } from '../../utils/nameof';

@Entity()
export class ClubMembership {
	@PrimaryColumn()
	public readonly clubId?: string;

	@ManyToOne(_ => Club, club => club.memberships, { eager: true })
	@JoinColumn({ name: nameof<ClubMembership>('clubId') })
	public club!: Club;

	@PrimaryColumn()
	public readonly userId?: string;

	@ManyToOne(_ => User, user => user.memberships, { eager: true })
	@JoinColumn({ name: nameof<ClubMembership>('userId') })
	public user!: User;

	@Column('enum', { enum: ClubRole })
	public clubRole!: ClubRole;

	public constructor(params?: {
		club: Club,
		user: User,
		clubRole?: ClubRole
	}) {
		if(params) {
			this.club = params.club;
			this.user = params.user;
			this.clubRole = params.clubRole ?? ClubRole.MEMBER;
		}
	}
}