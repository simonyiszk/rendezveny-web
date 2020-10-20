import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { User } from './User';
import { nameof } from '../../utils/nameof';
import { Event } from './Event';
import { OrganizerNotificationSettings } from './OrganizerNotificationSettings';

@Entity()
export class Organizer {
	@PrimaryColumn()
	public readonly eventId?: string;

	@ManyToOne(_ => Event, event => event.organizers, { eager: true })
	@JoinColumn({ name: nameof<Organizer>('eventId') })
	public event!: Event;

	@PrimaryColumn()
	public readonly userId?: string;

	@ManyToOne(_ => User, user => user.organizing, { eager: true })
	@JoinColumn({ name: nameof<Organizer>('userId') })
	public user!: User;

	@Column()
	public isChief!: boolean;

	@Column({ type: 'enum', enum: OrganizerNotificationSettings })
	public notificationSettings!: OrganizerNotificationSettings;

	public constructor(params?: {
		event: Event,
		user: User,
		isChief?: boolean,
		notificationSettings: OrganizerNotificationSettings
	}) {
		if(params) {
			this.event = params.event;
			this.user = params.user;
			this.isChief = params.isChief ?? false;
			this.notificationSettings = params.notificationSettings;
		}
	}
}