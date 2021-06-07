import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { FormQuestionMetadata, FormQuestionType } from './FormQuestion';
import { Tag } from './Tag';
import { BaseEntity } from '../utils/BaseEntity';

@Entity()
export class FormQuestionTemplate extends BaseEntity<FormQuestionTemplate> {
	@PrimaryGeneratedColumn('uuid')
	public readonly id!: string;

	@Column()
	public question!: string;

	@Column({ type: 'enum', enum: FormQuestionType })
	public type!: FormQuestionType;

	@Column({ type: 'json' })
	public typeMetadata!: FormQuestionMetadata;

	@ManyToMany(
		(_) => Tag,
		(tag) => tag.formQuestionTemplates
	)
	public tags!: Tag[];

	public constructor(params?: {
		question: string;
		type: FormQuestionType;
		typeMetadata: FormQuestionMetadata;
		tags?: Tag[];
	}) {
		super();
		if (params) {
			this.question = params.question;
			this.type = params.type;
			this.typeMetadata = params.typeMetadata;
			if (params.tags) {
				this.tags = params.tags;
			}
		}
	}
}
