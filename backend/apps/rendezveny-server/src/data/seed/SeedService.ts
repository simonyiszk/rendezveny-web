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

@Injectable()
export class SeedService {
	public constructor(
		@InjectEntityManager() private readonly entityManager: EntityManager,
		@InjectRepository(Club) private readonly clubRepository: Repository<Club>,
		@InjectRepository(User) private readonly userRepository: Repository<User>,
		@InjectRepository(LocalIdentity) private readonly localIdentityRepository: Repository<LocalIdentity>,
		@InjectRepository(ClubMembership) private readonly membershipRepository: Repository<ClubMembership>,
		@InjectRepository(RefreshToken) private readonly refreshTokenRepository: Repository<RefreshToken>
	) {}

	public async clearDatabase(): Promise<void> {
		try {
			await this.entityManager.query('SET FOREIGN_KEY_CHECKS = 0');
			await this.clubRepository.clear();
			await this.userRepository.clear();
			await this.localIdentityRepository.clear();
			await this.membershipRepository.clear();
			await this.refreshTokenRepository.clear();
		}
		finally {
			await this.entityManager.query('SET FOREIGN_KEY_CHECKS = 1');
		}
	}

	public async seedDatabase(): Promise<void> {
		/* Users */

		const john = new User({ name: 'John' });
		await this.userRepository.save(john);

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
	}
}