import { EntityManager, ObjectLiteral, Repository } from 'typeorm';
import { getEntityManagerOrTransactionManager } from 'typeorm-transactional-cls-hooked';

export class BaseRepository<Entity extends ObjectLiteral> extends Repository<Entity> {
	private mConnectionName: string = 'default'
	private mManager: EntityManager | undefined

	public get manager(): EntityManager {
		return getEntityManagerOrTransactionManager(this.mConnectionName, this.mManager);
	}

	public set manager(manager: EntityManager) {
		this.mManager = manager;
		this.mConnectionName = manager.connection.name;
	}
}