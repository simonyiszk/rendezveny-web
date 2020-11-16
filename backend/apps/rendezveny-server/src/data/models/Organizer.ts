import { Column, Entity, Generated, JoinColumn, ManyToMany, ManyToOne, PrimaryColumn } from 'typeorm';
import { User } from './User';
import { nameof } from '../../utils/nameof';
import { Event } from './Event';
import { OrganizerNotificationSettings } from './OrganizerNotificationSettings';
import { HRSegment } from './HRSegment';
import { BaseEntity } from '../utils/BaseEntity';

@Entity()
export class Organizer extends BaseEntity<Organizer> {
	@PrimaryColumn()
	@Generated('uuid')
	public readonly id!: string;

	@Column()
	public readonly eventId?: string;

	@ManyToOne(_ => Event, event => event.organizers, { eager: true, onDelete: 'CASCADE' })
	@JoinColumn({ name: nameof<Organizer>('eventId') })
	public event!: Event;

	@Column()
	public readonly userId?: string;

	@ManyToOne(_ => User, user => user.organizing, { eager: true, onDelete: 'CASCADE' })
	@JoinColumn({ name: nameof<Organizer>('userId') })
	public user!: User;

	@Column()
	public isChief!: boolean;

	@Column({ type: 'enum', enum: OrganizerNotificationSettings })
	public notificationSettings!: OrganizerNotificationSettings;

	@ManyToMany(_ => HRSegment, hrSegment => hrSegment.organizers)
	public hrSegments!: HRSegment[];

	public constructor(params?: {
		event: Event,
		user: User,
		isChief?: boolean,
		notificationSettings: OrganizerNotificationSettings
	}) {
		super();
		if(params) {
			this.event = params.event;
			this.user = params.user;
			this.isChief = params.isChief ?? false;
			this.notificationSettings = params.notificationSettings;
		}
	}
}