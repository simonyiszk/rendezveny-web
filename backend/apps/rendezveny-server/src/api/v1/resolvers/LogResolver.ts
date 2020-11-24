import { Query, Resolver } from '@nestjs/graphql';
import { UseFilters, UseGuards, UseInterceptors } from '@nestjs/common';
import { LoggingInterceptor } from '../../../business/log/LoggingInterceptor';
import { IssuerType, LogDTO, PaginatedLogDTO, ResultType } from '../dtos/LogDTO';
import { BusinessExceptionFilter } from '../utils/BusinessExceptionFilter';
import { AccessCtx, AuthAccessGuard } from '../../../business/auth/passport/AuthAccessJwtStrategy';
import { AccessContext } from '../../../business/auth/tokens/AccessToken';
import { Offset, PageSize } from '../utils/PaginatedDTO';
import { LogManager } from '../../../business/log/LogManager';
import { Log, LogType } from '../../../data/models/Log';

@Resolver((_: never) => LogDTO)
@UseInterceptors(LoggingInterceptor)
export class LogResolver {
	public constructor(
		private readonly logManager: LogManager
	) {
	}

	@Query(_ => PaginatedLogDTO, {
		name: 'logs_getAll',
		description: 'Gets all the logs'
	})
	@UseFilters(BusinessExceptionFilter)
	@UseGuards(AuthAccessGuard)
	public async getLogs(
		@AccessCtx() accessContext: AccessContext,
		@PageSize() pageSize: number,
		@Offset() offset: number,
	): Promise<PaginatedLogDTO> {
		const { logs, count } = await this.logManager.getAllLogPaginated(
			accessContext, pageSize, offset,
		);

		return {
			nodes: logs.map(log => LogResolver.logToDTO(log)),
			totalCount: count,
			pageSize: pageSize,
			offset: offset
		};
	}

	private static logToDTO(log: Log): LogDTO {
		return {
			id: log.id,
			ip: log.issuer.ip as string,
			type: LogResolver.parseIssuerType(log.issuer.type as string),
			issuerId: log.issuer.id as string,
			token: log.issuer.token as string,
			at: log.at,
			query: log.query,
			args: JSON.stringify(log.args),
			result: LogResolver.parseResultType(log.result)
		};
	}

	private static parseIssuerType(type: string): IssuerType {
		switch(type) {
			case 'public':
				return IssuerType.PUBLIC;
			case 'user':
				return IssuerType.USER;
			default:
				throw new Error();
		}
	}

	private static parseResultType(type: LogType): ResultType {
		switch(type) {
			case LogType.SUCCESS:
				return ResultType.SUCCESS;
			case LogType.UNAUTHORIZED:
				return ResultType.UNAUTHORIZED;
			case LogType.BUSINESS_ERROR:
				return ResultType.BUSINESS_ERROR;
			case LogType.OTHER_ERROR:
				return ResultType.OTHER_ERROR;
		}
	}
}