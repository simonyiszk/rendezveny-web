import { BaseManager, Manager } from '../utils/BaseManager';
import { AuthContext, AuthorizeGuard, IsAdmin, IsUser } from '../auth/AuthorizeGuard';
import { AccessContext } from '../auth/tokens/AccessToken';
import { Tag } from '../../data/models/Tag';
import { InjectRepository } from '@nestjs/typeorm';
import { checkArgument } from '../../utils/preconditions';
import { isNotEmpty } from 'class-validator';
import { TagInvalidNameException } from './exceptions/TagInvalidNameException';
import { TagAlreadyExistsException } from './exceptions/TagAlreadyExistsException';
import { TagDoesNotExistException } from './exceptions/TagDoesNotExistException';
import { TagRepository } from '../../data/repositories/repositories';
import { Transactional } from 'typeorm-transactional-cls-hooked';

@Manager()
export class TagManager extends BaseManager {
	public constructor(
		@InjectRepository(TagRepository) private readonly tagRepository: TagRepository
	) {
		super();
	}

	@AuthorizeGuard(IsUser(), IsAdmin())
	public async getAllTags(
		@AuthContext() _accessContext: AccessContext
	): Promise<Tag[]> {
		return this.tagRepository.find();
	}

	@Transactional()
	@AuthorizeGuard(IsAdmin())
	public async addTag(
		@AuthContext() _accessContext: AccessContext,
		name: string
	): Promise<Tag> {
		checkArgument(isNotEmpty(name), TagInvalidNameException);

		const tag = await this.tagRepository.findOne({ name });
		if(tag) {
			throw new TagAlreadyExistsException();
		}

		const newTag = new Tag({ name });
		await this.tagRepository.save(newTag);
		return newTag;
	}

	@Transactional()
	@AuthorizeGuard(IsAdmin())
	public async deleteTag(
		@AuthContext() _accessContext: AccessContext,
		name: string
	): Promise<void> {
		checkArgument(isNotEmpty(name), TagInvalidNameException);

		const tag = await this.tagRepository.findOne({ name });
		if(!tag) {
			throw new TagDoesNotExistException(name);
		}

		await this.tagRepository.remove(tag);
	}
}