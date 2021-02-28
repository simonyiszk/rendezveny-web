import { Column, Entity, Generated, JoinTable, ManyToMany, PrimaryColumn, Unique } from 'typeorm';
import { nameof } from '../../utils/nameof';
import { Event } from './Event';
import { FormQuestionTemplate } from './FormQuestionTemplate';

@Entity()
@Unique([nameof<Tag>('name')])
export class Tag {
	@PrimaryColumn()
	@Generated('uuid')
	public readonly id!: string;

	@Column()
	public name!: string;

	@ManyToMany(
		(_) => Event,
		(event) => event.tags
	)
	@JoinTable()
	public events!: Event[];

	@ManyToMany(
		(_) => FormQuestionTemplate,
		(formQuestionTemplate) => formQuestionTemplate.tags
	)
	@JoinTable()
	public formQuestionTemplates!: FormQuestionTemplate[];

	public constructor(params?: { name: string; events?: Event[]; formQuestionTemplates?: FormQuestionTemplate[] }) {
		if (params) {
			this.name = params.name;
			if (params.events) {
				this.events = params.events;
			}
			if (params.formQuestionTemplates) {
				this.formQuestionTemplates = params.formQuestionTemplates;
			}
		}
	}
}
