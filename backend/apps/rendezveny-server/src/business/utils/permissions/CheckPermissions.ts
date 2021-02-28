import { UnauthorizedException } from './UnauthorizedException';

export function checkPermission(...condition: boolean[]): void {
	if (condition.filter((c) => c).length === 0) {
		throw new UnauthorizedException();
	}
}
