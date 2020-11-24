import { Manager } from '../utils/BaseManager';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { LogRepository } from '../../data/repositories/repositories';
import { Log, LogType } from '../../data/models/Log';
import { AuthContext, AuthorizeGuard, IsAdmin } from '../auth/AuthorizeGuard';
import { AccessContext } from '../auth/tokens/AccessToken';
import { checkPagination } from '../utils/pagination/CheckPagination';
import { Cron } from '@nestjs/schedule';
import { LessThan } from 'typeorm';

@Manager()
export class LogManager {
	public constructor(
		private readonly jwtService: JwtService,
		@InjectRepository(LogRepository) private readonly logRepository: LogRepository
	) {
	}

	@AuthorizeGuard(IsAdmin())
	public async getAllLogPaginated(
		@AuthContext() _accessContext: AccessContext,
		pageSize: number, offset: number
	): Promise<{ logs: Log[], count: number}> {
		checkPagination(pageSize, offset);

		const [logs, count] = await this.logRepository.findAndCount({
			take: pageSize,
			skip: offset * pageSize,
			order: {
				at: 'DESC'
			}
		});

		return { logs, count };
	}

	public async saveLog(
		issuer: Record<string, unknown>, query: string, args: Record<string, unknown>, result: LogType
	): Promise<void> {
		const log = new Log({
			issuer: issuer,
			query: query,
			args: args,
			result: result,
			at: new Date()
		});

		await this.logRepository.save(log);
	}

	public decodeToken(token: string): unknown {
		return this.jwtService.decode(token);
	}

	@Cron('0 1 * * *')
	public async cleanLog(): Promise<void> {
		const previousMonth = new Date();
		previousMonth.setMonth(previousMonth.getMonth() - 1);
		await this.logRepository.delete({
			at: LessThan(previousMonth)
		});
	}
}