import { Column, Entity, Generated, ManyToMany, OneToMany, PrimaryColumn } from 'typeorm';
import { ClubMembership } from './ClubMembership';
import { Event } from './Event';

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

	@ManyToMany(_ => Event, event => event.hostingClubs)
	public hostedEvents!: Event[];

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