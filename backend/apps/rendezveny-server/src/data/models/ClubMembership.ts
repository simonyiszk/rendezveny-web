import { Club } from './Club';
import { Column, Entity, ManyToOne } from 'typeorm';
import { User } from './User';
import { ClubRole } from './ClubRole';

@Entity()
export class ClubMembership {
	@ManyToOne(_ => Club, club => club.memberships, { primary: true })
	public club!: Club;

	@ManyToOne(_ => User, user => user.memberships, { primary: true })
	public user!: User;

	@Column('enum', { enum: ClubRole })
	public clubRole!: ClubRole;
}