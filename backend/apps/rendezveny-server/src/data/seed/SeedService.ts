/* eslint-disable no-magic-numbers */
import { Injectable } from '@nestjs/common';
import { EntityManager, Repository } from 'typeorm';
import { Club } from '../models/Club';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { User } from '../models/User';
import { ClubMembership } from '../models/ClubMembership';
import { LocalIdentity } from '../models/LocalIdentity';
import { UserRole } from '../models/UserRole';
import { ClubRole } from '../models/ClubRole';
import { RefreshToken } from '../models/RefreshToken';
import { Event } from '../models/Event';
import { Registration } from '../models/Registration';
import { TemporaryIdentity } from '../models/TemporaryIdentity';
import { Organizer } from '../models/Organizer';
import { OrganizerNotificationSettings } from '../models/OrganizerNotificationSettings';
import { RegistrationNotificationSettings } from '../models/RegistrationNotificationSettings';
import { AuthManager } from '../../business/auth/AuthManager';
import { EventManager } from '../../business/events/EventManager';
import { JwtService } from '@nestjs/jwt';
import { AccessContext, AccessToken } from '../../business/auth/tokens/AccessToken';
import { FormQuestion, FormQuestionType } from '../models/FormQuestion';
import { FormQuestionAnswer } from '../models/FormQuestionAnswer';
import { HRTable } from '../models/HRTable';
import { HRTask } from '../models/HRTask';
import { HRSegment } from '../models/HRSegment';
import { Log } from '../models/Log';

@Injectable()
export class SeedService {
	public constructor(
		@InjectEntityManager() private readonly entityManager: EntityManager,
		@InjectRepository(Club) private readonly clubRepository: Repository<Club>,
		@InjectRepository(User) private readonly userRepository: Repository<User>,
		@InjectRepository(LocalIdentity) private readonly localIdentityRepository: Repository<LocalIdentity>,
		@InjectRepository(ClubMembership) private readonly membershipRepository: Repository<ClubMembership>,
		@InjectRepository(RefreshToken) private readonly refreshTokenRepository: Repository<RefreshToken>,
		@InjectRepository(Event) private readonly eventRepository: Repository<Event>,
		@InjectRepository(Registration) private readonly registrationRepository: Repository<Registration>,
		@InjectRepository(FormQuestion) private readonly formQuestionRepository: Repository<FormQuestion>,
		@InjectRepository(FormQuestionAnswer) private readonly formAnswerRepository: Repository<FormQuestionAnswer>,
		@InjectRepository(TemporaryIdentity) private readonly tempIdentityRepository: Repository<TemporaryIdentity>,
		@InjectRepository(Organizer) private readonly organizerRepository: Repository<Organizer>,
		@InjectRepository(HRTable) private readonly hrTableRepository: Repository<HRTable>,
		@InjectRepository(HRTask) private readonly hrTaskRepository: Repository<HRTask>,
		@InjectRepository(HRSegment) private readonly hrSegmentRepository: Repository<HRSegment>,
		@InjectRepository(Log) private readonly logRepository: Repository<Log>,
		private readonly authManager: AuthManager,
		private readonly eventManager: EventManager,
		private readonly jwtService: JwtService
	) {}

	public async clearDatabase(): Promise<void> {
		try {
			await this.entityManager.query('SET FOREIGN_KEY_CHECKS = 0');
			await this.clubRepository.clear();
			await this.userRepository.clear();
			await this.localIdentityRepository.clear();
			await this.membershipRepository.clear();
			await this.refreshTokenRepository.clear();
			await this.eventRepository.clear();
			await this.registrationRepository.clear();
			await this.formQuestionRepository.clear();
			await this.formAnswerRepository.clear();
			await this.tempIdentityRepository.clear();
			await this.organizerRepository.clear();
			await this.hrTableRepository.clear();
			await this.hrTaskRepository.clear();
			await this.hrSegmentRepository.clear();
			await this.logRepository.clear();
		}
		finally {
			await this.entityManager.query('SET FOREIGN_KEY_CHECKS = 1');
		}
	}

	public async seedDatabase(): Promise<void> {
		/* Users */

		const john = new User({ name: 'John', role: UserRole.ADMIN });
		await this.userRepository.save(john);
		await this.localIdentityRepository.save(new LocalIdentity({
			username: 'john',
			email: 'john@localhost',
			password: 'eQ8Q6H1OKUFMlxspJlM2FYTa6JlifufuqdEM+ULLRXzhalHO6PZN1nRQoEh/7zwTDJ+gvXaDeln1OGDTjG/1KQ==', // "admin"
			passwordVersion: 1,
			salt: 'G5wEYCwf2rFtgZq41j+yDYXAvgoGmKjwNWAM+wgG0f8iG3r3xRx9G+Inup5Gd0J521XMHXLQVIL/MJQa0YcOzw==',
			user: john
		}));

		const peter = new User({ name: 'Peter' });
		await this.userRepository.save(peter);

		const april = new User({ name: 'April' });
		await this.userRepository.save(april);
		await this.localIdentityRepository.save(new LocalIdentity({
			username: 'april',
			email: 'april@localhost',
			password: 'eQ8Q6H1OKUFMlxspJlM2FYTa6JlifufuqdEM+ULLRXzhalHO6PZN1nRQoEh/7zwTDJ+gvXaDeln1OGDTjG/1KQ==', // "admin"
			passwordVersion: 1,
			salt: 'G5wEYCwf2rFtgZq41j+yDYXAvgoGmKjwNWAM+wgG0f8iG3r3xRx9G+Inup5Gd0J521XMHXLQVIL/MJQa0YcOzw==',
			user: april
		}));

		const emily = new User({ name: 'Emily' });
		await this.userRepository.save(emily);
		await this.localIdentityRepository.save(new LocalIdentity({
			username: 'emily',
			email: 'emily@localhost',
			password: 'eQ8Q6H1OKUFMlxspJlM2FYTa6JlifufuqdEM+ULLRXzhalHO6PZN1nRQoEh/7zwTDJ+gvXaDeln1OGDTjG/1KQ==', // "admin"
			passwordVersion: 1,
			salt: 'G5wEYCwf2rFtgZq41j+yDYXAvgoGmKjwNWAM+wgG0f8iG3r3xRx9G+Inup5Gd0J521XMHXLQVIL/MJQa0YcOzw==',
			user: emily
		}));

		const admin = new User({ name: 'Administrator', role: UserRole.ADMIN });
		await this.userRepository.save(admin);
		await this.localIdentityRepository.save(new LocalIdentity({
			username: 'admin',
			email: 'admin@localhost',
			password: 'eQ8Q6H1OKUFMlxspJlM2FYTa6JlifufuqdEM+ULLRXzhalHO6PZN1nRQoEh/7zwTDJ+gvXaDeln1OGDTjG/1KQ==', // "admin"
			passwordVersion: 1,
			salt: 'G5wEYCwf2rFtgZq41j+yDYXAvgoGmKjwNWAM+wgG0f8iG3r3xRx9G+Inup5Gd0J521XMHXLQVIL/MJQa0YcOzw==',
			user: admin
		}));

		/* Clubs */

		const geekClub = new Club({ name: 'Geek Club' });
		await this.clubRepository.save(geekClub);

		const fencingClub = new Club({ name: 'Fencing Club' });
		await this.clubRepository.save(fencingClub);

		const bookClub = new Club({ name: 'Book Club' });
		await this.clubRepository.save(bookClub);

		/* Membershisp */

		await this.membershipRepository.save(new ClubMembership({
			user: john, club: geekClub
		}));
		await this.membershipRepository.save(new ClubMembership({
			user: john, club: fencingClub
		}));
		await this.membershipRepository.save(new ClubMembership({
			user: peter, club: fencingClub
		}));
		await this.membershipRepository.save(new ClubMembership({
			user: april, club: bookClub, clubRole: ClubRole.CLUB_MANAGER
		}));
		await this.membershipRepository.save(new ClubMembership({
			user: emily, club: bookClub
		}));
		await this.membershipRepository.save(new ClubMembership({
			user: admin, club: geekClub
		}));

		/* Events */

		const galaDinner = new Event({ // John already registered
			name: 'Gala dinner',
			uniqueName: 'gala-dinner',
			description: 'Gala dinner',
			place: 'SCH',
			start: new Date(2020, 11, 23, 18, 0),
			end: new Date(2020, 11, 23, 22, 58),
			registrationStart: new Date(2020, 9, 20, 18, 0),
			registrationEnd: new Date(2020, 11, 20, 12, 0),
			isDateOrTime: false,
			isClosedEvent: true,
			hostingClubs: [geekClub, bookClub]
		});
		await this.eventRepository.save(galaDinner);

		const semesterEndDinner = new Event({ // John can attend
			name: 'Semester end dinner',
			uniqueName: 'semester-end-dinner',
			description: 'Semester end dinner',
			place: 'SCH',
			start: new Date(2020, 11, 24, 18, 0),
			end: new Date(2020, 11, 24, 22, 58),
			registrationStart: new Date(2020, 9, 20, 18, 0),
			registrationEnd: new Date(2020, 11, 20, 12, 0),
			isDateOrTime: false,
			isClosedEvent: true,
			hostingClubs: [geekClub]
		});
		await this.eventRepository.save(semesterEndDinner);

		const privateParty = new Event({ // John can not attend
			name: 'Private party',
			uniqueName: 'private-party',
			description: 'Private party',
			place: 'SCH',
			start: new Date(2020, 11, 24, 18, 0),
			end: new Date(2020, 11, 24, 22, 58),
			registrationStart: new Date(2020, 9, 20, 18, 0),
			registrationEnd: new Date(2020, 11, 20, 12, 0),
			isDateOrTime: false,
			isClosedEvent: true,
			hostingClubs: [bookClub]
		});
		await this.eventRepository.save(privateParty);

		const birthdayParty = new Event({ // Public event, John can attend
			name: 'Birthday party',
			uniqueName: 'birthday-party',
			description: 'Birthday party',
			place: 'SCH',
			start: new Date(2020, 11, 26, 18, 0),
			end: new Date(2020, 11, 26, 22, 58),
			registrationStart: new Date(2020, 9, 20, 18, 0),
			registrationEnd: new Date(2020, 11, 20, 12, 0),
			isDateOrTime: false,
			isClosedEvent: false,
			hostingClubs: [geekClub, bookClub]
		});
		await this.eventRepository.save(birthdayParty);

		const johnsParty = new Event({ // John is chief organizer
			name: 'John\' party',
			uniqueName: 'johns-party',
			description: 'John\' party',
			place: 'SCH',
			start: new Date(2020, 11, 26, 18, 0),
			end: new Date(2020, 11, 26, 22, 58),
			registrationStart: new Date(2020, 9, 20, 18, 0),
			registrationEnd: new Date(2020, 11, 20, 12, 0),
			isDateOrTime: false,
			isClosedEvent: false,
			hostingClubs: [geekClub]
		});
		await this.eventRepository.save(johnsParty);

		const emilysParty = new Event({ // John is organizer
			name: 'Emily\'s party',
			uniqueName: 'emily-party',
			description: 'Emily\'s party',
			place: 'SCH',
			start: new Date(2020, 11, 26, 18, 0),
			end: new Date(2020, 11, 26, 22, 58),
			registrationStart: new Date(2020, 9, 20, 18, 0),
			registrationEnd: new Date(2020, 11, 20, 12, 0),
			isDateOrTime: false,
			isClosedEvent: false,
			hostingClubs: [geekClub]
		});
		await this.eventRepository.save(emilysParty);

		const aprilGalaDinner = new Organizer({
			event: galaDinner, user: april, isChief: true, notificationSettings: OrganizerNotificationSettings.ALL
		});
		await this.organizerRepository.save(aprilGalaDinner);

		const emilyGalaDinner = new Organizer({
			event: galaDinner, user: emily, isChief: false, notificationSettings: OrganizerNotificationSettings.ALL
		});
		await this.organizerRepository.save(emilyGalaDinner);

		const johnJohnParty = new Organizer({
			event: johnsParty, user: john, isChief: true, notificationSettings: OrganizerNotificationSettings.ALL
		});
		await this.organizerRepository.save(johnJohnParty);
		
		const johnEmilyParty = new Organizer({
			event: emilysParty, user: john, isChief: false, notificationSettings: OrganizerNotificationSettings.ALL
		});
		await this.organizerRepository.save(johnEmilyParty);

		const johnGalaDinner = new Registration({
			event: galaDinner,
			user: john,
			registrationDate: new Date(),
			notificationSettings: RegistrationNotificationSettings.ALL
		});
		await this.registrationRepository.save(johnGalaDinner);

		/* Form */

		const foodPreference = new FormQuestion({
			question: 'Food preference',
			event: galaDinner,
			order: 0,
			type: FormQuestionType.MULTIPLE_CHOICE,
			typeMetadata: {
				type: 'multiple_choice',
				multipleAnswers: false,
				options: [
					{ id: 'regular', text: 'Regular' },
					{ id: 'vegi', text: 'Vegetarian' }
				]
			},
			isRequired: true
		});

		const nickName = new FormQuestion({
			question: 'Nickname',
			event: galaDinner,
			order: 1,
			type: FormQuestionType.TEXT,
			typeMetadata: {
				type: 'text',
				maxLength: 25
			},
			isRequired: true
		});

		await this.formQuestionRepository.save([foodPreference, nickName]);

		const nickName2 = new FormQuestion({
			question: 'Nickname',
			event: semesterEndDinner,
			order: 1,
			type: FormQuestionType.TEXT,
			typeMetadata: {
				type: 'text',
				maxLength: 25
			},
			isRequired: true
		});

		await this.formQuestionRepository.save([nickName2]);

		const nickName3 = new FormQuestion({
			question: 'Nickname',
			event: privateParty,
			order: 1,
			type: FormQuestionType.TEXT,
			typeMetadata: {
				type: 'text',
				maxLength: 25
			},
			isRequired: true
		});

		await this.formQuestionRepository.save([nickName3]);

		const johnFoodPreference = new FormQuestionAnswer({
			formQuestion: foodPreference,
			registration: johnGalaDinner,
			answer: {
				type: 'multiple_choice',
				options: ['regular']
			}
		});

		const johnNickName = new FormQuestionAnswer({
			formQuestion: nickName,
			registration: johnGalaDinner,
			answer: {
				type: 'text',
				text: 'Johnny'
			}
		});

		await this.formAnswerRepository.save([johnFoodPreference, johnNickName]);

		/* HR Table */

		const galaHRTable = new HRTable({ event: galaDinner, isLocked: false });
		await this.hrTableRepository.save(galaHRTable);

		const setTablesTask = new HRTask({
			name: 'Set table',
			start: new Date(),
			end: new Date(),
			order: 0,
			isLocked: false,
			hrTable: galaHRTable
		});

		const waiteringTask = new HRTask({
			name: 'Waitering',
			start: new Date(),
			end: new Date(),
			order: 0,
			isLocked: false,
			hrTable: galaHRTable
		});

		await this.hrTaskRepository.save([setTablesTask, waiteringTask]);

		const setTablesSegment = new HRSegment({
			capacity: 1,
			start: new Date(),
			end: new Date(),
			isRequired: true,
			isLocked: false,
			hrTask: setTablesTask,
			organizers: [aprilGalaDinner]
		});

		const waiteringPrecourseSegment = new HRSegment({
			capacity: 2,
			start: new Date(),
			end: new Date(),
			isRequired: true,
			isLocked: false,
			hrTask: waiteringTask,
			organizers: [aprilGalaDinner, emilyGalaDinner]
		});

		const waiteringMaincourseSegment = new HRSegment({
			capacity: 1,
			start: new Date(),
			end: new Date(),
			isRequired: false,
			isLocked: false,
			hrTask: waiteringTask,
			organizers: []
		});

		await this.hrSegmentRepository.save([setTablesSegment, waiteringPrecourseSegment, waiteringMaincourseSegment]);

		/* Postman environment */

		const adminToken = (await this.authManager.loginWithLocalIdentity('admin', 'admin')).access;
		const aprilToken = (await this.authManager.loginWithLocalIdentity('april', 'admin')).access;
		const emilyToken = (await this.authManager.loginWithLocalIdentity('emily', 'admin')).access;
		const johnToken = (await this.authManager.loginWithLocalIdentity('john', 'admin')).access;

		/* eslint-disable max-len */
		console.log(JSON.stringify({
			id: '55ec8ea2-4ac2-4f9f-aff3-84bd58cdd186',
			name: 'Simonyi Rendezvény',
			values: [
				{
					key: 'url',
					value: 'http://localhost:3000/api/v1',
					enabled: true
				},
				{
					key: 'user_token',
					value: emilyToken,
					enabled: true
				},
				{
					key: 'manager_token',
					value: aprilToken,
					enabled: true
				},
				{
					key: 'admin_token',
					value: adminToken,
					enabled: true
				},
				{
					key: 'registration_token',
					value: await this.eventManager.getEventToken(new AccessContext(this.jwtService.decode(johnToken) as AccessToken), galaDinner),
					enabled: true
				},
				{
					key: 'organizer_token',
					value: await this.eventManager.getEventToken(new AccessContext(this.jwtService.decode(emilyToken) as AccessToken), galaDinner),
					enabled: true
				},
				{
					key: 'chief_organizer_token',
					value: await this.eventManager.getEventToken(new AccessContext(this.jwtService.decode(aprilToken) as AccessToken), galaDinner),
					enabled: true
				},
				{
					key: 'event_id',
					value: galaDinner.id,
					enabled: true
				}
			]
		}));
		/* eslint-enable max-len */
	}
}