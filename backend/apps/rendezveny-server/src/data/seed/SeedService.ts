import { Injectable } from '@nestjs/common';
import { EntityManager, Repository } from 'typeorm';
import { Club } from '../models/Club';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class SeedService {
	public constructor(
		@InjectEntityManager() private readonly entityManager: EntityManager,
		@InjectRepository(Club) private readonly clubRepository: Repository<Club>
	) {}

	public async clearDatabase(): Promise<void> {
		try {
			await this.entityManager.query('SET FOREIGN_KEY_CHECKS = 0');
			await this.clubRepository.clear();
		}
		finally {
			await this.entityManager.query('SET FOREIGN_KEY_CHECKS = 1');
		}
	}

	public async seedDatabase(): Promise<void> {
		const geekClub = new Club();
		geekClub.name = 'Geek Club';
		await this.clubRepository.save(geekClub);

		const fencingClub = new Club();
		fencingClub.name = 'Fencing Club';
		await this.clubRepository.save(fencingClub);

		const bookClub = new Club();
		bookClub.name = 'Book Club';
		await this.clubRepository.save(bookClub);
	}
}