import { Injectable } from '@nestjs/common';
import { EntityManager, Repository, Transaction, TransactionManager } from 'typeorm';
import { Club } from '../../data/models/Club';
import { checkArgument } from '../../utils/preconditions';
import { InvalidPaginationPageSizeException } from '../utils/InvalidPaginationPageSizeException';
import { InvalidPaginationOffsetException } from '../utils/InvalidPaginationOffsetException';
import { ClubWithNameExistsException } from './ClubWithNameExistsException';
import { ClubDoesNotExistsException } from './ClubDoesNotExistsException';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ClubManager {
	public constructor(
		@InjectRepository(Club) private readonly clubRepository: Repository<Club>
	) {}

	public async getAllClubs(): Promise<{ clubs: Club[], count: number}> {
		const [clubs, count] = await this.clubRepository.findAndCount();
		return { clubs, count };
	}

	public async getAllClubsPaginated(
		pageSize: number, offset: number
	): Promise<{ clubs: Club[], count: number}> {
		checkArgument(pageSize > 0, InvalidPaginationPageSizeException, pageSize);
		checkArgument(offset >= 0, InvalidPaginationOffsetException, offset);

		const [clubs, count] = await this.clubRepository.findAndCount({
			take: pageSize,
			skip: offset * pageSize
		});
		return { clubs, count };
	}

	public async getClub(
		id: string
	): Promise<Club> {
		const club = await this.clubRepository.findOne({ id });

		if(!club) {
			throw new ClubDoesNotExistsException(id);
		}
		else {
			return club;
		}
	}

	@Transaction()
	public async addClub(
		name: string,
		@TransactionManager() _entityManager?: EntityManager
	): Promise<Club> {
		const clubWithName = await this.clubRepository.findOne({ name });

		if(clubWithName) {
			throw new ClubWithNameExistsException(name);
		}
		else {
			const club = new Club();
			club.name = name;
			return this.clubRepository.save(club);
		}
	}

	@Transaction()
	public async editClub(
		id: string, name: string,
		@TransactionManager() _entityManager?: EntityManager
	): Promise<Club> {
		const club = await this.clubRepository.findOne({ id });

		if(!club) {
			throw new ClubDoesNotExistsException(id);
		}
		else {
			club.name = name;
			return this.clubRepository.save(club, { });
		}
	}

	@Transaction()
	public async deleteClub(
		id: string,
		@TransactionManager() _entityManager?: EntityManager
	): Promise<void> {
		const club = await this.clubRepository.findOne({ id });

		if(!club) {
			throw new ClubDoesNotExistsException(id);
		}
		else {
			await this.clubRepository.remove(club);
		}
	}
}