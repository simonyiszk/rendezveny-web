/* eslint-disable max-classes-per-file */
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { createParamDecorator, ExecutionContext, Injectable, Request } from '@nestjs/common';
import { Token } from 'graphql';
import { checkArgument } from '../../../utils/preconditions';
import { AuthInvalidTokenException } from '../exceptions/AuthInvalidTokenException';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthJwtGuard } from './AuthJwtGuard';
import { isRefreshToken, RefreshContext, RefreshToken } from '../tokens/RefreshToken';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthRefreshJwtStrategy extends PassportStrategy(Strategy, 'refresh') {
	public constructor(configService: ConfigService) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: configService.get<boolean>('debug'),
			secretOrKey: configService.get('token.secret')
		});
	}

	public async validate(payload: Token): Promise<RefreshToken> {
		checkArgument(isRefreshToken(payload), AuthInvalidTokenException);
		return (payload as unknown) as RefreshToken;
	}
}

@Injectable()
export class AuthRefreshGuard extends AuthJwtGuard('refresh') {
	public getRequest(context: ExecutionContext): Request {
		const ctx = GqlExecutionContext.create(context);
		return ctx.getContext().req;
	}
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const RefreshCtx = createParamDecorator((data: unknown, context: ExecutionContext) => {
	const ctx = GqlExecutionContext.create(context);
	return new RefreshContext(ctx.getContext().req.user as RefreshToken);
});
