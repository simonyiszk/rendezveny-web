import { mixin } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Type } from '@nestjs/passport/dist/interfaces';
import { IAuthGuard } from '@nestjs/passport/dist/auth.guard';
import { UnauthorizedException } from '../utils/UnauthorizedException';

// eslint-disable-next-line @typescript-eslint/naming-convention
export function AuthJwtGuard(type: string): Type<IAuthGuard> {
	return mixin(class extends AuthGuard(type) {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		public handleRequest<TUser = any>(err: any, user: any, _info: any, _context: any, _status?: any): TUser {
			if(err !== null || user === null) {
				throw new UnauthorizedException();
			}
			else {
				return user;
			}
		}
	});
}