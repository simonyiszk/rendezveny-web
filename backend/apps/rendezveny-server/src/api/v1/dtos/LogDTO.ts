// eslint-disable-next-line max-classes-per-file
import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { PaginatedDTO } from '../utils/PaginatedDTO';

export enum IssuerType {
	USER,
	PUBLIC
}
registerEnumType(IssuerType, {
	name: 'IssuerType'
});

export enum ResultType {
	SUCCESS,
	UNAUTHORIZED,
	BUSINESS_ERROR,
	OTHER_ERROR
}
registerEnumType(ResultType, {
	name: 'ResultType'
});

@ObjectType({
	description: 'Log entry'
})
export class LogDTO {
	@Field()
	public id: string = '';

	@Field()
	public ip: string = '';

	@Field({ nullable: true })
	public token?: string = '';

	@Field((_) => IssuerType)
	public type!: IssuerType;

	@Field({ nullable: true })
	public issuerId?: string = '';

	@Field()
	public at!: Date;

	@Field()
	public query: string = '';

	@Field()
	public args: string = '';

	@Field((_) => ResultType)
	public result!: ResultType;
}

@ObjectType()
export class PaginatedLogDTO extends PaginatedDTO(LogDTO) {}
