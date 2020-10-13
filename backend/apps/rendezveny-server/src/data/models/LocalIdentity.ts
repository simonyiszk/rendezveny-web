import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn, Unique } from 'typeorm';
import { User } from './User';

@Entity()
@Unique(['email'])
export class LocalIdentity {
	@PrimaryColumn()
	public username!: string;

	@Column()
	public email!: string;

	@Column()
	public password!: string;

	@Column()
	public salt!: string;

	@OneToOne(_ => User, async user => user.localIdentity)
	@JoinColumn()
	public user!: Promise<User>;
}