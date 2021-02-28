import { Repository } from 'typeorm';

export abstract class BaseEntity<T extends { id: string }> {
	public async loadRelation(repository: Repository<T>, ...name: (keyof T)[]): Promise<void> {
		const loaded = await repository.findOne(((this as unknown) as T).id, { relations: [...name] as string[] });
		for (const n of name) {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment,line-comment-position
			// @ts-ignore
			this[n] = loaded ? loaded[n] : [];
		}
	}
}
