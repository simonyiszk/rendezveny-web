import { Column, Entity, Generated, JoinColumn, JoinTable, ManyToMany, ManyToOne, PrimaryColumn } from 'typeorm';
import { Organizer } from './Organizer';
import { HRTask } from './HRTask';
import { nameof } from '../../utils/nameof';
import { BaseEntity } from '../utils/BaseEntity';

@Entity()
export class HRSegment extends BaseEntity<HRSegment> {
	@PrimaryColumn()
	@Generated('uuid')
	public readonly id!: string;

	@Column()
	public capacity!: number;

	@Column()
	public isRequired!: boolean;

	@Column({ type: 'timestamp' })
	public start!: Date;

	@Column({ type: 'timestamp' })
	public end!: Date;

	@Column()
	public isLocked!: boolean;

	@Column()
	public readonly hrTaskId!: string;

	@ManyToOne(
		(_) => HRTask,
		(hrTask) => hrTask.hrSegments,
		{ onDelete: 'CASCADE' }
	)
	@JoinColumn({ name: nameof<HRSegment>('hrTaskId') })
	public hrTask!: HRTask;

	@ManyToMany(
		(_) => Organizer,
		(organizer) => organizer.hrSegments
	)
	@JoinTable()
	public organizers!: Organizer[];

	public constructor(params?: {
		capacity: number;
		isRequired: boolean;
		start: Date;
		end: Date;
		isLocked: boolean;
		hrTask: HRTask;
		organizers?: Organizer[];
	}) {
		super();
		if (params) {
			this.capacity = params.capacity;
			this.isRequired = params.isRequired;
			this.start = params.start;
			this.end = params.end;
			this.isLocked = params.isLocked;
			this.hrTask = params.hrTask;
			if (params.organizers) {
				this.organizers = params.organizers;
			}
		}
	}
}
