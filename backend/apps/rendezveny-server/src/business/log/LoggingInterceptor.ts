/* eslint-disable @typescript-eslint/no-explicit-any */
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { GqlExecutionContext } from '@nestjs/graphql';
import { isRefreshToken } from '../auth/tokens/RefreshToken';
import { isAccessToken } from '../auth/tokens/AccessToken';
import { isEventToken } from '../auth/tokens/EventToken';
import { LogType } from '../../data/models/Log';
import { UnauthorizedException } from '../utils/permissions/UnauthorizedException';
import { BusinessException } from '../utils/BusinessException';
import { LogManager } from './LogManager';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
	public constructor(private readonly logManager: LogManager) {}

	/* eslint-disable @typescript-eslint/naming-convention */
	private readonly redaction = {
		login_withLocalIdentity: ['password']
	};
	/* eslint-enable @typescript-eslint/naming-convention */

	public async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
		const ctx = GqlExecutionContext.create(context);

		const query = ctx.getInfo().fieldName as string;
		const args = Object.create(ctx.getArgs() as any);
		for (const arg in args) {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment,line-comment-position
			// @ts-ignore
			// eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
			if (this.redaction[query]?.includes(arg) === true) {
				args[arg] = '[REDACTED]';
			}
		}

		const { req } = ctx.getContext();
		const ip = (req.headers['x-forwarded-for'] as string) || req.connection.remoteAddress;
		const authHeader = req.header('Authorization');

		const issuer =
			authHeader !== undefined
				? // eslint-disable-next-line no-magic-numbers
				  { ip: ip, token: authHeader.substr(7), ...this.decodeToken(authHeader.substr(7)) }
				: { ip: ip, type: 'public' };

		return next.handle().pipe(
			tap(async (_) => {
				await this.logManager.saveLog(issuer, query, args, LogType.SUCCESS);
			}),
			catchError(async (err: any) => {
				if (err instanceof UnauthorizedException) {
					await this.logManager.saveLog(issuer, query, args, LogType.UNAUTHORIZED);
				} else if (err instanceof BusinessException) {
					await this.logManager.saveLog(issuer, query, args, LogType.BUSINESS_ERROR);
				} else {
					await this.logManager.saveLog(issuer, query, args, LogType.OTHER_ERROR);
				}
				return Promise.resolve(err);
			})
		);
	}

	private decodeToken(token: string): { id: string; type: 'user' | 'temporary' } {
		const decodedToken = this.logManager.decodeToken(token);
		if (isRefreshToken(decodedToken)) {
			return {
				id: decodedToken.uid,
				type: 'user'
			};
		} else if (isAccessToken(decodedToken)) {
			return {
				id: decodedToken.uid,
				type: 'user'
			};
		} else if (isEventToken(decodedToken)) {
			if (decodedToken.reg !== 'none') {
				return {
					id: decodedToken.reg.uid,
					type: 'user'
				};
			} else if (decodedToken.org !== 'none') {
				return {
					id: decodedToken.org.uid,
					type: 'user'
				};
			}
		}

		throw new Error();
	}
}
