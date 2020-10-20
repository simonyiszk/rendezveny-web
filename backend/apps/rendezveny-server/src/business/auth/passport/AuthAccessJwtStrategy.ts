/* eslint-disable max-classes-per-file */
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { createParamDecorator, ExecutionContext, Injectable, Request } from '@nestjs/common';
import { Token } from 'graphql';
import { checkArgument } from '../../../utils/preconditions';
import { AccessContext, AccessToken, isAccessToken } from '../AuthTokens';
import { AuthInvalidTokenException } from '../exceptions/AuthInvalidTokenException';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthJwtGuard } from './AuthJwtGuard';

@Injectable()
export class AuthAccessJwtStrategy extends PassportStrategy(Strategy, 'access') {
	public constructor() {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: 'rendezveny'
		});
	}

	public async validate(payload: Token): Promise<AccessToken> {
		checkArgument(isAccessToken(payload), AuthInvalidTokenException);
		return payload as unknown as AccessToken;
	}
}

@Injectable()
export class AuthAccessGuard extends AuthJwtGuard('access') {
	public getRequest(context: ExecutionContext): Request {
		const ctx = GqlExecutionContext.create(context);
		return ctx.getContext().req;
	}
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const AccessCtx = createParamDecorator((data: unknown, context: ExecutionContext) => {
	const ctx = GqlExecutionContext.create(context);
	return new AccessContext(ctx.getContext().req.user as AccessToken);
});