import { Column, Entity, Generated, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryColumn } from 'typeorm';
import { User } from './User';
import { nameof } from '../../utils/nameof';
import { Event } from './Event';
import { RegistrationNotificationSettings } from './RegistrationNotificationSettings';
import { TemporaryIdentity } from './TemporaryIdentity';
import { FormQuestionAnswer } from './FormQuestionAnswer';
import { BaseEntity } from '../utils/BaseEntity';

@Entity()
export class Registration extends BaseEntity<Registration> {
	@PrimaryColumn()
	@Generated('uuid')
	public readonly id!: string;

	@Column()
	public readonly eventId?: string;

	@ManyToOne(_ => Event, event => event.registrations, { eager: true, onDelete: 'CASCADE' })
	@JoinColumn({ name: nameof<Registration>('eventId') })
	public event!: Event;

	@Column()
	public readonly userId?: string;

	@ManyToOne(_ => User, user => user.registrations, { eager: true, nullable: true, onDelete: 'CASCADE' })
	@JoinColumn({ name: nameof<Registration>('userId') })
	public user?: User;

	@OneToOne(_ => TemporaryIdentity, temporaryIdentity => temporaryIdentity.registration, {
		onDelete: 'CASCADE',
		nullable: true,
		eager: true
	})
	@JoinColumn()
	public temporaryIdentity?: TemporaryIdentity;

	@Column({ type: 'timestamp', nullable: true })
	public registrationDate!: Date;

	@Column({ type: 'timestamp', nullable: true })
	public attendDate?: Date;

	@Column({ type: 'enum', enum: RegistrationNotificationSettings })
	public notificationSettings!: RegistrationNotificationSettings;

	@OneToMany(_ => FormQuestionAnswer, answer => answer.registration, {
		onDelete: 'CASCADE'
	})
	public formAnswers!: FormQuestionAnswer[];

	public constructor(params?: (
		{ user?: User, temporaryIdentity: TemporaryIdentity } | { user: User, temporaryIdentity?: TemporaryIdentity }
	) & {
		event: Event,
		registrationDate: Date,
		attendDate?: Date,
		notificationSettings: RegistrationNotificationSettings,
		formAnswers?: FormQuestionAnswer[]
	}) {
		super();
		if(params) {
			this.event = params.event;
			if(params.user) {
				this.user = params.user;
			}
			if(params.temporaryIdentity) {
				this.temporaryIdentity = params.temporaryIdentity;
			}
			this.registrationDate = params.registrationDate;
			if(params.attendDate) {
				this.attendDate = params.attendDate;
			}
			this.notificationSettings = params.notificationSettings;
			if(params.formAnswers) {
				this.formAnswers = params.formAnswers;
			}
		}
	}
}