import { Column, Entity, Generated, JoinColumn, OneToMany, OneToOne, PrimaryColumn } from 'typeorm';
import { HRTask } from './HRTask';
import { Event } from './Event';
import { BaseEntity } from '../utils/BaseEntity';
import { nameof } from '../../utils/nameof';

@Entity()
export class HRTable extends BaseEntity<HRTable> {
	@PrimaryColumn()
	@Generated('uuid')
	public readonly id!: string;

	@Column()
	public isLocked!: boolean;

	@Column()
	public readonly eventId!: string;

	@OneToOne(
		(_) => Event,
		(event) => event.hrTable
	)
	@JoinColumn({ name: nameof<HRTable>('eventId') })
	public event!: Event;

	@OneToMany(
		(_) => HRTask,
		(hrTask) => hrTask.hrTable,
		{
			onDelete: 'CASCADE'
		}
	)
	public hrTasks!: HRTask[];

	public constructor(params?: { isLocked: boolean; event: Event; hrTasks?: HRTask[] }) {
		super();
		if (params) {
			this.isLocked = params.isLocked;
			this.event = params.event;
			if (params.hrTasks) {
				this.hrTasks = params.hrTasks;
			}
		}
	}
}
