import { Column, Entity, Generated, OneToMany, OneToOne, PrimaryColumn } from 'typeorm';
import { HRTask } from './HRTask';
import { Event } from './Event';

@Entity()
export class HRTable {
	@PrimaryColumn()
	@Generated('uuid')
	public readonly id!: string;

	@Column()
	public isLocked!: boolean;

	@Column()
	public readonly eventId!: string;

	@OneToOne(_ => Event, event => event.hrTable)
	public event!: Event;

	@OneToMany(_ => HRTask, hrTask => hrTask.hrTable, {
		onDelete: 'CASCADE'
	})
	public hrTasks!: HRTask[];

	public constructor(params?: {
		isLocked: boolean,
		event: Event,
		hrTasks?: HRTask[]
	}) {
		if(params) {
			this.isLocked = params.isLocked;
			this.event = params.event;
			if(params.hrTasks) {
				this.hrTasks = params.hrTasks;
			}
		}
	}
}