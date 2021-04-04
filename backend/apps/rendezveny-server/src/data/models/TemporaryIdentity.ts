import { Column, Entity, Generated, OneToOne, PrimaryColumn } from 'typeorm';
import { Registration } from './Registration';

@Entity()
export class TemporaryIdentity {
	@PrimaryColumn()
	@Generated('uuid')
	public readonly token!: string;

	@Column()
	public email!: string;

	@Column({ type: 'varchar', nullable: true })
	public name!: string | null;

	@OneToOne(
		(_) => Registration,
		(registration) => registration.temporaryIdentity,
		{
			onDelete: 'SET NULL'
		}
	)
	public registration!: Registration;

	public constructor(params?: { email: string; name: string; registration?: Registration }) {
		if (params) {
			this.email = params.email;
			this.name = params.name;
			if (params.registration) {
				this.registration = params.registration;
			}
		}
	}
}
