import { Column, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserRole } from './UserRole';
import { LocalIdentity } from './LocalIdentity';
import { ClubMembership } from './ClubMembership';
import { RefreshToken } from './RefreshToken';
import { Registration } from './Registration';
import { Organizer } from './Organizer';
import { BaseEntity } from '../utils/BaseEntity';
import { AuthSCHIdentity } from './AuthSCHIdentity';

@Entity()
export class User extends BaseEntity<User> {
	@PrimaryGeneratedColumn('uuid')
	public readonly id!: string;

	@Column()
	public name!: string;

	@Column('enum', { enum: UserRole })
	public role!: UserRole;

	@Column()
	public isSuspended!: boolean;

	@OneToOne(
		(_) => LocalIdentity,
		(localIdentity) => localIdentity.user,
		{
			onDelete: 'CASCADE'
		}
	)
	public localIdentity?: LocalIdentity;

	@OneToOne(
		(_) => AuthSCHIdentity,
		(authSCHIdentity) => authSCHIdentity.user,
		{
			onDelete: 'CASCADE'
		}
	)
	public authSCHIdentity?: AuthSCHIdentity;

	@OneToMany(
		(_) => ClubMembership,
		(membership) => membership.user,
		{
			onDelete: 'CASCADE'
		}
	)
	public memberships!: ClubMembership[];

	@OneToMany(
		(_) => RefreshToken,
		(token) => token.user,
		{
			onDelete: 'CASCADE'
		}
	)
	public refreshTokens!: RefreshToken[];

	@OneToMany(
		(_) => Registration,
		(registration) => registration.user,
		{
			onDelete: 'CASCADE'
		}
	)
	public registrations!: Registration[];

	@OneToMany(
		(_) => Organizer,
		(organizing) => organizing.user,
		{
			onDelete: 'CASCADE'
		}
	)
	public organizing!: Organizer[];

	public constructor(params?: {
		name: string;
		role?: UserRole;
		isSuspended?: boolean;
		localIdentity?: LocalIdentity;
		authSCHIdentity?: AuthSCHIdentity;
		memberships?: ClubMembership[];
	}) {
		super();
		if (params) {
			this.name = params.name;
			this.role = params.role ?? UserRole.USER;
			this.isSuspended = params.isSuspended ?? false;
			if (params.localIdentity) {
				this.localIdentity = params.localIdentity;
			}
			if (params.authSCHIdentity) {
				this.authSCHIdentity = params.authSCHIdentity;
			}
			if (params.memberships) {
				this.memberships = params.memberships;
			}
		}
	}
}
