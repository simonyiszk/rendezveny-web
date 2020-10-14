import { Column, Entity, Generated, OneToMany, PrimaryColumn } from 'typeorm';
import { ClubMembership } from './ClubMembership';

@Entity()
export class Club {
	@PrimaryColumn()
	@Generated('uuid')
	public readonly id!: string;

	@Column()
	public name!: string;

	@OneToMany(_ => ClubMembership, membership => membership.club, {
		onDelete: 'CASCADE'
	})
	public memberships!: ClubMembership[];

	public constructor(params?: {
		name: string,
		memberships?: ClubMembership[]
	}) {
		if(params) {
			this.name = params.name;
			if(params.memberships) {
				this.memberships = params.memberships;
			}
		}
	}
}