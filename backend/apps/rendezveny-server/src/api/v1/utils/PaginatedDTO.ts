import { Type } from '@nestjs/common';
import { Field, Int, ObjectType } from '@nestjs/graphql';

interface IPaginatedType<T> {
	nodes: T[];
	totalCount: number;
	pageSize?: number;
	offset?: number;
}

// eslint-disable-next-line @typescript-eslint/naming-convention,@typescript-eslint/no-explicit-any
export function PaginatedDTO<T>(classRef: Type<T>): new() => IPaginatedType<T> {
	@ObjectType({ isAbstract: true })
	class BasePaginatedType implements IPaginatedType<T> {
		@Field(_ => [classRef], {
			description: 'The paginated data'
		})
		public nodes!: T[];

		@Field(_ => Int, {
			description: 'The total number of data entries'
		})
		public totalCount!: number;

		@Field(_ => Int, {
			nullable: true,
			description: 'The size of the page, if pagination is enabled'
		})
		public pageSize?: number;

		@Field(_ => Int, {
			nullable: true,
			description: 'The offset of the page, if pagination is enabled'
		})
		public offset?: number;
	}

	return BasePaginatedType;
}