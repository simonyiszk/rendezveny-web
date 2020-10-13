import { BusinessException } from '../utils/BusinessException';

export class ClubDoesNotExistsException extends BusinessException {
	public constructor(id: string) {
		super(
			'CLUB_DOES_NOT_EXISTS',
			`Club with id ${id} does not exists`,
			{ id }
		);
	}
}