import { Column, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ClubMembership } from './ClubMembership';
import { Event } from './Event';
import { BaseEntity } from '../utils/BaseEntity';

@Entity()
export class Club extends BaseEntity<Club> {
	@PrimaryGeneratedColumn('uuid')
	public readonly id!: string;

	@Column()
	public name!: string;

	@Column()
	public externalId!: number;

	@OneToMany(
		(_) => ClubMembership,
		(membership) => membership.club,
		{
			onDelete: 'CASCADE'
		}
	)
	public memberships!: ClubMembership[];

	@ManyToMany(
		(_) => Event,
		(event) => event.hostingClubs
	)
	public hostedEvents!: Event[];

	public constructor(params?: { name: string; externalId: number; memberships?: ClubMembership[] }) {
		super();
		if (params) {
			this.name = params.name;
			this.externalId = params.externalId;
			if (params.memberships) {
				this.memberships = params.memberships;
			}
		}
	}
}
