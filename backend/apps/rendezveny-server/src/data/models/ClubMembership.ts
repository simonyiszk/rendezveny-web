import { Club } from './Club';
import { Column, Entity, ManyToOne } from 'typeorm';
import { User } from './User';
import { ClubRole } from './ClubRole';

@Entity()
export class ClubMembership {
	@ManyToOne(_ => Club, async club => club.memberships, { primary: true })
	public club!: Promise<Club>;

	@ManyToOne(_ => User, async user => user.memberships, { primary: true })
	public user!: Promise<User>;

	@Column('enum', { enum: ClubRole })
	public clubRole!: ClubRole;
}