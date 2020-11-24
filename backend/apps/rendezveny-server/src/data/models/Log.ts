import { Column, Entity, Generated, PrimaryColumn } from 'typeorm';
import { BaseEntity } from '../utils/BaseEntity';

export enum LogType {
	SUCCESS,
	UNAUTHORIZED,
	BUSINESS_ERROR,
	OTHER_ERROR,
}

@Entity()
export class Log extends BaseEntity<Log> {
	@PrimaryColumn()
	@Generated('uuid')
	public readonly id!: string;

	@Column({ type: 'timestamp' })
	public at!: Date;

	@Column({ type: 'json' })
	public issuer!: Record<string, unknown>;

	@Column()
	public query!: string;

	@Column({ type: 'json' })
	public args!: Record<string, unknown>;

	@Column('enum', { enum: LogType })
	public result!: LogType;

	public constructor(params?: {
		at: Date, issuer: Record<string, unknown>, query: string, args: Record<string, unknown>, result: LogType
	}) {
		super();
		if(params) {
			this.at = params.at;
			this.issuer = params.issuer;
			this.query = params.query;
			this.args = params.args;
			this.result = params.result;
		}
	}
}