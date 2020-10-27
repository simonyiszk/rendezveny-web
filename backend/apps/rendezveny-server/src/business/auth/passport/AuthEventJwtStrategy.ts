/* eslint-disable max-classes-per-file */
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { createParamDecorator, ExecutionContext, Injectable, Request } from '@nestjs/common';
import { Token } from 'graphql';
import { checkArgument } from '../../../utils/preconditions';
import { AuthInvalidTokenException } from '../exceptions/AuthInvalidTokenException';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthJwtGuard } from './AuthJwtGuard';
import { EventContext, EventToken, isEventToken } from '../tokens/EventToken';

@Injectable()
export class AuthEventJwtStrategy extends PassportStrategy(Strategy, 'event') {
	public constructor() {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: true,
			secretOrKey: 'rendezveny'
		});
	}

	public async validate(payload: Token): Promise<EventToken> {
		checkArgument(isEventToken(payload), AuthInvalidTokenException);
		return payload as unknown as EventToken;
	}
}

@Injectable()
export class AuthEventGuard extends AuthJwtGuard('event') {
	public getRequest(context: ExecutionContext): Request {
		const ctx = GqlExecutionContext.create(context);
		return ctx.getContext().req;
	}
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const EventCtx = createParamDecorator((data: unknown, context: ExecutionContext) => {
	const ctx = GqlExecutionContext.create(context);
	return new EventContext(ctx.getContext().req.user as EventToken);
});