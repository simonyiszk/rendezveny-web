import { Column, Entity, Generated, JoinTable, ManyToMany, OneToMany, OneToOne, PrimaryColumn } from 'typeorm';
import { Club } from './Club';
import { Tag } from './Tag';
import { Registration } from './Registration';
import { Organizer } from './Organizer';
import { BaseEntity } from '../utils/BaseEntity';
import { FormQuestion } from './FormQuestion';
import { HRTable } from './HRTable';

@Entity()
export class Event extends BaseEntity<Event> {
	@PrimaryColumn()
	@Generated('uuid')
	public readonly id!: string;

	@Column()
	public name!: string;

	@Column()
	public uniqueName!: string;

	@Column()
	public description!: string;

	@Column({ nullable: true })
	public place?: string;

	@Column({ nullable: true })
	public capacity?: number;

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

	@Column({ nullable: true })
	public registrationAllowed?: boolean;

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

	@OneToMany(_ => FormQuestion, formQuestion => formQuestion.event, {
		onDelete: 'CASCADE'
	})
	public formQuestions!: FormQuestion[];

	@OneToOne(_ => HRTable, hrTable => hrTable.event, {
		onDelete: 'CASCADE',
		nullable: true
	})
	public hrTable?: HRTable;

	public constructor(params?: {
		name: string,
		uniqueName: string,
		description: string,
		place?: string,
		capacity?: number,
		start?: Date,
		end?: Date,
		isDateOrTime?: boolean
		registrationStart?: Date,
		registrationEnd?: Date,
		registrationAllowed?: boolean,
		isClosedEvent?: boolean,
		hostingClubs?: Club[],
		tags?: Tag[],
		formQuestions?: FormQuestion[],
		hrTable?: HRTable
	}) {
		super();
		if(params) {
			this.name = params.name;
			this.uniqueName = params.uniqueName;
			this.description = params.description;
			this.place = params.place;
			this.capacity = params.capacity;
			this.start = params.start;
			this.end = params.end;
			this.isDateOrTime = params.isDateOrTime ?? false;
			this.registrationStart = params.registrationStart;
			this.registrationEnd = params.registrationEnd;
			this.registrationAllowed = params.registrationAllowed;
			this.isClosedEvent = params.isClosedEvent ?? false;
			if(params.hostingClubs) {
				this.hostingClubs = params.hostingClubs;
			}
			if(params.tags) {
				this.tags = params.tags;
			}
			if(params.formQuestions) {
				this.formQuestions = params.formQuestions;
			}
			this.hrTable = params.hrTable;
		}
	}
}