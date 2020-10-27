import { Column, Entity, Generated, JoinTable, ManyToMany, OneToMany, PrimaryColumn } from 'typeorm';
import { Club } from './Club';
import { Tag } from './Tag';
import { Registration } from './Registration';
import { Organizer } from './Organizer';
import { BaseEntity } from '../utils/BaseEntity';

@Entity()
export class Event extends BaseEntity<Event> {
	@PrimaryColumn()
	@Generated('uuid')
	public readonly id!: string;

	@Column()
	public name!: string;

	@Column()
	public description!: string;

	@Column()
	public place?: string;

	@Column({ type: 'timestamp', nullable: true })
	public start?: Date;

	@Column({ type: 'timestamp', nullable: true })
	public end?: Date;

	@Column()
	public isDateOrTime!: boolean;

	@Column({ type: 'timestamp', nullable: true })
	public registrationStart?: Date;

	@Column({ type: 'timestamp', nullable: true })
	public registrationEnd?: Date;

	@Column()
	public isClosedEvent!: boolean;

	@ManyToMany(_ => Club, club => club.hostedEvents)
	@JoinTable()
	public hostingClubs!: Club[];

	@ManyToMany(_ => Tag, tag => tag.events)
	public tags!: Tag[];

	@OneToMany(_ => Registration, registration => registration.event, {
		onDelete: 'CASCADE'
	})
	public registrations!: Registration[];

	@OneToMany(_ => Organizer, organizer => organizer.event, {
		onDelete: 'CASCADE'
	})
	public organizers!: Organizer[];

	public constructor(params?: {
		name: string,
		description: string,
		place?: string,
		start?: Date,
		end?: Date,
		isDateOrTime?: boolean
		registrationStart?: Date,
		registrationEnd?: Date,
		isClosedEvent?: boolean,
		hostingClubs?: Club[],
		tags?: Tag[]
	}) {
		super();
		if(params) {
			this.name = params.name;
			this.description = params.description;
			this.place = params.place;
			this.start = params.start;
			this.end = params.end;
			this.isDateOrTime = params.isDateOrTime ?? false;
			this.registrationStart = params.registrationStart;
			this.registrationEnd = params.registrationEnd;
			this.isClosedEvent = params.isClosedEvent ?? false;
			if(params.hostingClubs) {
				this.hostingClubs = params.hostingClubs;
			}
			if(params.tags) {
				this.tags = params.tags;
			}
		}
	}
}