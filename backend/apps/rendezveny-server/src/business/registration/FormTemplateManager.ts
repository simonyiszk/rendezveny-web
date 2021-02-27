import { BaseManager, Manager } from '../utils/BaseManager';
import { InjectRepository } from '@nestjs/typeorm';
import { In } from 'typeorm';
import { AuthContext, AuthorizeGuard, IsAdmin, IsManager, IsUser } from '../auth/AuthorizeGuard';
import { FormQuestionTemplate } from '../../data/models/FormQuestionTemplate';
import { AccessContext } from '../auth/tokens/AccessToken';
import { checkPagination } from '../utils/pagination/CheckPagination';
import { Tag } from '../../data/models/Tag';
import { FormQuestionTemplateRepository } from '../../data/repositories/repositories';

@Manager()
export class FormTemplateManager extends BaseManager {
	public constructor(
		@InjectRepository(FormQuestionTemplateRepository)
		private readonly templateRepository: FormQuestionTemplateRepository
	) {
		super();
	}

	public async getAllTemplates(
	): Promise<{ templates: FormQuestionTemplate[], count: number}> {
		const [templates, count] = await this.templateRepository.findAndCount();
		return { templates, count };
	}

	public async getAllTemplatesPaginated(
		pageSize: number, offset: number
	): Promise<{ templates: FormQuestionTemplate[], count: number}> {
		checkPagination(pageSize, offset);

		const [templates, count] = await this.templateRepository.findAndCount({
			take: pageSize,
			skip: offset * pageSize
		});

		return { templates, count };
	}

	@AuthorizeGuard(IsManager(), IsAdmin())
	public async findTemplatesPaginated(
		@AuthContext() _accessContext: AccessContext,
		pageSize: number, offset: number,
		criteria: { tags?: [Tag] }
	): Promise<{ templates: FormQuestionTemplate[], count: number}> {
		checkPagination(pageSize, offset);

		let whereCriteria = {};
		if(criteria.tags) {
			whereCriteria = {
				...whereCriteria,
				tags: In(criteria.tags)
			};
		}

		const [templates, count] = await this.templateRepository.findAndCount({
			take: pageSize,
			skip: offset * pageSize,
			where: whereCriteria
		});

		return { templates, count };
	}
}

