import { Entity, Generated, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { User } from './User';

@Entity()
export class RefreshToken {
	@PrimaryColumn()
	@Generated('uuid')
	public readonly id!: string;

	@PrimaryColumn()
	public readonly userId?: string;

	@ManyToOne(_ => User, user => user.refreshTokens, { eager: true })
	@JoinColumn({ name: 'userId' })
	public user!: User;

	public constructor(params?: {
		user: User
	}) {
		if(params) {
			this.user = params.user;
		}
	}
}