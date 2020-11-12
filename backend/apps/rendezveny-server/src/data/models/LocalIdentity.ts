import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn, Unique } from 'typeorm';
import { User } from './User';
import { nameof } from '../../utils/nameof';

@Entity()
@Unique([nameof<LocalIdentity>('email')])
export class LocalIdentity {
	@PrimaryColumn()
	public username!: string;

	@Column()
	public email!: string;

	@Column()
	public password!: string;

	@Column()
	public salt!: string;

	@Column()
	public passwordVersion!: number;

	@OneToOne(_ => User, user => user.localIdentity, { eager: true })
	@JoinColumn()
	public user!: User;

	public constructor(params?: {
		username: string,
		email: string,
		password: string,
		salt: string,
		passwordVersion: number,
		user?: User
	}) {
		if(params) {
			this.username = params.username;
			this.email = params.email;
			this.password = params.password;
			this.salt = params.salt;
			this.passwordVersion = params.passwordVersion;
			if(params.user) {
				this.user = params.user;
			}
		}
	}
}