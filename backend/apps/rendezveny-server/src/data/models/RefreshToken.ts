import { Entity, Generated, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { User } from './User';
import { nameof } from '../../utils/nameof';
import { BaseEntity } from '../utils/BaseEntity';

@Entity()
export class RefreshToken extends BaseEntity<RefreshToken> {
	@PrimaryColumn()
	@Generated('uuid')
	public readonly id!: string;

	@PrimaryColumn()
	public readonly userId?: string;

	@ManyToOne(
		(_) => User,
		(user) => user.refreshTokens,
		{ eager: true, onDelete: 'CASCADE' }
	)
	@JoinColumn({ name: nameof<RefreshToken>('userId') })
	public user!: User;

	public constructor(params?: { user: User }) {
		super();
		if (params) {
			this.user = params.user;
		}
	}
}
