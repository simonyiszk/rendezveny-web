import { Column, Entity, Generated, JoinTable, ManyToMany, PrimaryColumn, Unique } from 'typeorm';
import { nameof } from '../../utils/nameof';
import { Event } from './Event';

@Entity()
@Unique([nameof<Tag>('name')])
export class Tag {
	@PrimaryColumn()
	@Generated('uuid')
	public readonly id!: string;

	@Column()
	public name!: string;

	@ManyToMany(_ => Event, event => event.tags)
	@JoinTable()
	public events!: Event[];

	public constructor(params?: {
		name: string,
		events?: Event[]
	}) {
		if(params) {
			this.name = params.name;
			if(params.events) {
				this.events = params.events;
			}
		}
	}
}