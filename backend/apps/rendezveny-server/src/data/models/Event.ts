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

	@Column({ type: 'varchar', nullable: true })
	public place!: string | null;

	@Column({ type: 'int', nullable: true })
	public capacity!: number | null;

	@Column({ type: 'timestamp', nullable: true })
	public start!: Date | null;

	@Column({ type: 'timestamp', nullable: true })
	public end!: Date | null;

	@Column()
	public isDateOrTime!: boolean;

	@Column({ type: 'timestamp', nullable: true })
	public registrationStart!: Date | null;

	@Column({ type: 'timestamp', nullable: true })
	public registrationEnd!: Date | null;

	@Column({ type: 'boolean', nullable: true })
	public registrationAllowed!: boolean | null;

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
	public hrTable!: HRTable | null;

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
			this.place = params.place ?? null;
			this.capacity = params.capacity ?? null;
			this.start = params.start ?? null;
			this.end = params.end ?? null;
			this.isDateOrTime = params.isDateOrTime ?? false;
			this.registrationStart = params.registrationStart ?? null;
			this.registrationEnd = params.registrationEnd ?? null;
			this.registrationAllowed = params.registrationAllowed ?? null;
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
			this.hrTable = params.hrTable ?? null;
		}
	}
}