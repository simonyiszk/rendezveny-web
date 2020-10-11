import { Column, Entity, Generated, OneToMany, OneToOne, PrimaryColumn } from 'typeorm';
import { UserRole } from './UserRole';
import { LocalIdentity } from './LocalIdentity';
import { ClubMembership } from './ClubMembership';

@Entity()
export class User {
	@PrimaryColumn()
	@Generated('uuid')
	public id!: string;

	@Column()
	public name!: string;

	@Column('enum', { enum: UserRole })
	public role!: UserRole;

	@Column()
	public isSuspended!: boolean;

	@OneToOne(_ => LocalIdentity, localIdentity => localIdentity.user, {
		onDelete: 'CASCADE'
	})
	public localIdentity?: LocalIdentity;

	@OneToMany(_ => ClubMembership, membership => membership.user, {
		onDelete: 'CASCADE'
	})
	public memberships: ClubMembership[];
}