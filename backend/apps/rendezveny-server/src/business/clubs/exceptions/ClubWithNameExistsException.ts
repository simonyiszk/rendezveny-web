import { BusinessException } from '../../utils/BusinessException';

export class ClubWithNameExistsException extends BusinessException {
	public constructor(name: string) {
		super(
			'CLUB_WITH_NAME_EXISTS',
			`Club with name ${name} already exists`,
			{ name }
		);
	}
}