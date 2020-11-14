import { Column, Entity, Generated, ManyToMany, OneToMany, PrimaryColumn } from 'typeorm';
import { ClubMembership } from './ClubMembership';
import { Event } from './Event';
import { BaseEntity } from '../utils/BaseEntity';

@Entity()
export class Club extends BaseEntity<Club> {
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
		super();
		if(params) {
			this.name = params.name;
			if(params.memberships) {
				this.memberships = params.memberships;
			}
		}
	}
}