import { Args, Query, Resolver } from '@nestjs/graphql';
import { UserDTO } from '../dtos/UserDTO';

@Resolver(_ => UserDTO)
export class UsersResolver {
	@Query(_ => [UserDTO], {
		name: 'getUsers',
		description: 'Gets the users in the system'
	})
	public async getUsers(): Promise<UserDTO[]> {
		return [
			{ id: 'abcd', name: 'Földi Eper' },
			{ id: 'efgh', name: 'Figy Elek' }
		];
	}

	@Query(_ => UserDTO, {
		name: 'getUser',
		description: 'Gets one user based on its id'
	})
	public async getUser(
		@Args('id', { description: 'The id of the user' }) id: string
	): Promise<UserDTO> {
		return {
			id: id,
			name: 'Földi Eper'
		};
	}
}