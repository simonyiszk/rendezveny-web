import { Column, Entity, Generated, OneToMany, PrimaryColumn } from 'typeorm';
import { ClubMembership } from './ClubMembership';

@Entity()
export class Club {
	@PrimaryColumn()
	@Generated('uuid')
	public id!: string;

	@Column()
	public name!: string;

	@OneToMany(_ => ClubMembership, membership => membership.club, {
		onDelete: 'CASCADE'
	})
	public memberships!: ClubMembership[];
}