import { BusinessException } from '../../utils/BusinessException';

export class ClubNameValidationException extends BusinessException {
	public constructor() {
		super('CLUB_NAME_VALIDATION', "Club's name must not be empty", {});
	}
}
