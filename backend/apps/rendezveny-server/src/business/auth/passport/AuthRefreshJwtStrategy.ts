/* eslint-disable max-classes-per-file */
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { createParamDecorator, ExecutionContext, Injectable, Request } from '@nestjs/common';
import { Token } from 'graphql';
import { checkArgument } from '../../../utils/preconditions';
import { isRefreshToken, RefreshToken } from '../AuthTokens';
import { AuthInvalidTokenException } from '../exceptions/AuthInvalidTokenException';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthJwtGuard } from './AuthJwtGuard';

@Injectable()
export class AuthRefreshJwtStrategy extends PassportStrategy(Strategy, 'refresh') {
	public constructor() {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: 'rendezveny'
		});
	}

	public async validate(payload: Token): Promise<RefreshToken> {
		checkArgument(isRefreshToken(payload), AuthInvalidTokenException);
		return payload as unknown as RefreshToken;
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
export const RefreshContext = createParamDecorator((data: unknown, context: ExecutionContext) => {
	const ctx = GqlExecutionContext.create(context);
	return ctx.getContext().req.user as RefreshToken;
});