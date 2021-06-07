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
import { AuthManager } from '../../business/auth/AuthManager';
import { EventManager } from '../../business/events/EventManager';
import { JwtService } from '@nestjs/jwt';
import { FormQuestion, FormQuestionType } from '../models/FormQuestion';
import { FormQuestionAnswer } from '../models/FormQuestionAnswer';
import { HRTable } from '../models/HRTable';
import { HRTask } from '../models/HRTask';
import { HRSegment } from '../models/HRSegment';
import { Log } from '../models/Log';
import { AuthSCHIdentity } from '../models/AuthSCHIdentity';
import { FormQuestionTemplate } from '../models/FormQuestionTemplate';
import { CryptoService } from '../../business/crypto/CryptoService';

@Injectable()
export class SeedService {
	public constructor(
		@InjectEntityManager() private readonly entityManager: EntityManager,
		@InjectRepository(Club) private readonly clubRepository: Repository<Club>,
		@InjectRepository(User) private readonly userRepository: Repository<User>,
		@InjectRepository(LocalIdentity) private readonly localIdentityRepository: Repository<LocalIdentity>,
		@InjectRepository(AuthSCHIdentity) private readonly authSCHIdentityRepository: Repository<AuthSCHIdentity>,
		@InjectRepository(ClubMembership) private readonly membershipRepository: Repository<ClubMembership>,
		@InjectRepository(RefreshToken) private readonly refreshTokenRepository: Repository<RefreshToken>,
		@InjectRepository(Event) private readonly eventRepository: Repository<Event>,
		@InjectRepository(Registration) private readonly registrationRepository: Repository<Registration>,
		@InjectRepository(FormQuestionTemplate) private readonly formTempRepository: Repository<FormQuestionTemplate>,
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
		private readonly jwtService: JwtService,
		private readonly cryptoService: CryptoService
	) {}

	public async clearDatabase(): Promise<void> {
		try {
			await this.entityManager.query('SET session_replication_role = replica;');
			await this.clubRepository.delete({});
			await this.userRepository.delete({});
			await this.localIdentityRepository.delete({});
			await this.authSCHIdentityRepository.delete({});
			await this.membershipRepository.delete({});
			await this.refreshTokenRepository.delete({});
			await this.eventRepository.delete({});
			await this.registrationRepository.delete({});
			await this.formTempRepository.delete({});
			await this.formQuestionRepository.delete({});
			await this.formAnswerRepository.delete({});
			await this.tempIdentityRepository.delete({});
			await this.organizerRepository.delete({});
			await this.hrTableRepository.delete({});
			await this.hrTaskRepository.delete({});
			await this.hrSegmentRepository.delete({});
			await this.logRepository.delete({});
		} finally {
			await this.entityManager.query('SET session_replication_role = DEFAULT;');
		}
	}

	private readonly salt =
		process.env.PASSWORD_SALT ??
		'G5wEYCwf2rFtgZq41j+yDYXAvgoGmKjwNWAM+wgG0f8iG3r3xRx9G+Inup5Gd0J521XMHXLQVIL/MJQa0YcOzw==';

	private readonly members = {
		cucu: 'bozsik.szabolcs',
		dani: 'vanko.daniel',
		dave: 'kiss.david',
		bea: 'sudi.beata',
		bazs: 'frey.balazs',
		balazska: 'bidlo.balazs',
		adi: 'kiss.adam',
		johnny: 'feher.janos',
		barni: 'borcsok.barnabas',
		laci: 'sepsi.laszlo',
		andris: 'borbas.andras',
		pali: 'weisz.pal'
	};

	private readonly groups = [
		'ac',
		'bss',
		'mgmt',
		'kirdev',
		'sem',
		'schdesign',
		'phd',
		'cica',
		'kezek',
		'simonyi',
		'oregek',
		'weeb'
	];

	private readonly memberships = {
		ac: { lead: 'cucu', members: ['dave', 'balazska', 'andris', 'pali'] },
		bss: { lead: 'balazska', members: ['cucu', 'dave', 'barni', 'pali'] },
		mgmt: { lead: 'dani', members: ['cucu', 'dave', 'bea', 'bazs'] },
		kirdev: { lead: 'laci', members: ['dani', 'bazs', 'johnny', 'barni'] },
		sem: { lead: 'pali', members: ['bea', 'adi', 'balazska', 'andris'] },
		schdesign: { lead: 'barni', members: ['dani', 'bazs', 'johnny', 'andris'] },
		phd: { lead: 'adi', members: ['bea', 'balazska', 'laci', 'pali'] },
		cica: { lead: 'bea', members: ['cucu', 'adi', 'laci', 'andris'] },
		kezek: { lead: 'dave', members: ['bea', 'johnny', 'barni', 'pali'] },
		simonyi: { lead: 'bazs', members: ['cucu', 'dani', 'balazska', 'barni'] },
		oregek: { lead: 'johnny', members: ['dave', 'bazs', 'adi', 'laci'] },
		weeb: { lead: 'andris', members: ['dani', 'adi', 'johnny', 'laci'] }
	};

	public async seedDatabase(): Promise<void> {
		/* Users */

		const membersCreated = {} as { [key: string]: User };

		for (const [k, v] of Object.entries(this.members)) {
			const obj = new User({ name: k });
			await this.userRepository.save(obj);
			await this.localIdentityRepository.save(
				new LocalIdentity({
					username: v,
					email: `${k}@localhost`,
					password: (await this.cryptoService.hashPassword('x', 1, this.salt)).hashedPassword,
					passwordVersion: 1,
					salt: this.salt,
					user: obj
				})
			);
			membersCreated[k] = obj;
		}

		const admin = new User({ name: 'admin', role: UserRole.ADMIN });
		await this.userRepository.save(admin);
		await this.localIdentityRepository.save(
			new LocalIdentity({
				username: 'admin',
				email: 'admin@localhost',
				password: (await this.cryptoService.hashPassword('admin', 1, this.salt)).hashedPassword,
				passwordVersion: 1,
				salt: this.salt,
				user: admin
			})
		);

		/* Clubs */

		const groupsCreated = {} as { [key: string]: Club };
		for (const g of this.groups) {
			const obj = new Club({ name: g, externalId: 1 });
			await this.clubRepository.save(obj);
			groupsCreated[g] = obj;
		}

		/* Membershisp */

		for (const [k, v] of Object.entries(this.memberships)) {
			await this.membershipRepository.save(
				new ClubMembership({
					user: membersCreated[v.lead],
					club: groupsCreated[k],
					clubRole: ClubRole.CLUB_MANAGER
				})
			);
			for (const m of v.members) {
				await this.membershipRepository.save(
					new ClubMembership({
						user: membersCreated[m],
						club: groupsCreated[k],
						clubRole: ClubRole.MEMBER
					})
				);
			}
		}

		/* Template */

		const foodPrefTemplate = new FormQuestionTemplate({
			question: 'Étel érzékenység',
			type: FormQuestionType.MULTIPLE_CHOICE,
			typeMetadata: {
				type: 'multiple_choice',
				multipleAnswers: true,
				options: [
					{ id: 'laktoz', text: 'Laktóz' },
					{ id: 'gluten', text: 'Glutén' },
					{ id: 'vega', text: 'Vegetáriánus' }
				]
			}
		});

		const nickNameTemplate = new FormQuestionTemplate({
			question: 'Mi a beceneved?',
			type: FormQuestionType.TEXT,
			typeMetadata: {
				type: 'text',
				maxLength: 25
			}
		});

		const accomodationTemplate = new FormQuestionTemplate({
			question: 'Melyik napokra kérsz szállást?',
			type: FormQuestionType.MULTIPLE_CHOICE,
			typeMetadata: {
				type: 'multiple_choice',
				options: [
					{ id: 'friday', text: 'Péntek' },
					{ id: 'saturday', text: 'Szombat' }
				],
				multipleAnswers: true
			}
		});

		await this.formTempRepository.save([foodPrefTemplate, nickNameTemplate, accomodationTemplate]);
	}
}
