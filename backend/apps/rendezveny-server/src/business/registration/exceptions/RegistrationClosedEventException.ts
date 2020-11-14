import { BusinessException } from '../../utils/BusinessException';
import { Club } from '../../../data/models/Club';

export class RegistrationClosedEventException extends BusinessException {
	public constructor(clubs: Club[]) {
		super(
			'REGISTRATION_CLOSED_EVENT',
			`Cannot register for a closed event if you are not member of the hosting clubs: ${clubs.map(c => c.name).join(', ')}`,
			{
				clubs: clubs.map(c => c.id)
			}
		);
	}
}