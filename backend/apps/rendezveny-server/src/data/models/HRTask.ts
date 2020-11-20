import { Column, Entity, Generated, JoinColumn, ManyToOne, OneToMany, PrimaryColumn } from 'typeorm';
import { HRSegment } from './HRSegment';
import { nameof } from '../../utils/nameof';
import { HRTable } from './HRTable';
import { BaseEntity } from '../utils/BaseEntity';

@Entity()
export class HRTask extends BaseEntity<HRTask> {
	@PrimaryColumn()
	@Generated('uuid')
	public readonly id!: string;

	@Column()
	public name!: string;

	@Column({ type: 'timestamp' })
	public start!: Date;

	@Column({ type: 'timestamp' })
	public end!: Date;

	@Column()
	public order!: number;

	@Column()
	public isLocked!: boolean;

	@Column()
	public readonly hrTableId!: string;

	@ManyToOne(_ => HRTable, hrTable => hrTable.hrTasks, { onDelete: 'CASCADE' })
	@JoinColumn({ name: nameof<HRTask>('hrTableId') })
	public hrTable!: HRTable;

	@OneToMany(_ => HRSegment, hrSegment => hrSegment.hrTask, {
		onDelete: 'CASCADE'
	})
	public hrSegments!: HRSegment[];

	public constructor(params?: {
		name: string,
		start: Date,
		end: Date,
		order: number,
		isLocked: boolean,
		hrTable: HRTable,
		hrSegments?: HRSegment[]
	}) {
		super();
		if(params) {
			this.name = params.name;
			this.start = params.start;
			this.end = params.end;
			this.order = params.order;
			this.isLocked = params.isLocked;
			this.hrTable = params.hrTable;
			if(params.hrSegments) {
				this.hrSegments = params.hrSegments;
			}
		}
	}
}