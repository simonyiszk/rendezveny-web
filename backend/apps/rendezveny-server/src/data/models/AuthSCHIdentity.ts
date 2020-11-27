import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { User } from './User';

@Entity()
export class AuthSCHIdentity {
	@PrimaryColumn()
	public externalId!: string;

	@Column()
	public email!: string;

	@OneToOne(_ => User, user => user.authSCHIdentity, { eager: true })
	@JoinColumn()
	public user!: User;

	public constructor(params?: {
		externalId: string,
		email: string,
		user?: User
	}) {
		if(params) {
			this.externalId = params.externalId;
			this.email = params.email;
			if(params.user) {
				this.user = params.user;
			}
		}
	}
}