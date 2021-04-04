/* eslint-disable max-classes-per-file */
import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { EventRelationDTO } from './EventRelationDTO';

@ObjectType({
	description: 'The data of a segment of a HR table'
})
export class HRSegmentDTO {
	@Field({
		description: 'The id of the segment'
	})
	public id: string = '';

	@Field({
		description: 'The capacity of the segment'
	})
	public capacity: number = 1;

	@Field({
		description: 'Indicates whether the job is required or not'
	})
	public isRequired: boolean = true;

	@Field({
		description: 'The start of the segment'
	})
	public start: Date = new Date();

	@Field({
		description: 'The end of the segment'
	})
	public end: Date = new Date();

	@Field({
		description: 'Indicates whether organizers are allowed to self-assign'
	})
	public isLocked: boolean = false;

	@Field((_) => [EventRelationDTO], {
		description: 'The organizers assigned to this segment'
	})
	public organizers?: EventRelationDTO[];
}

@ObjectType({
	description: 'The data of a task of a HR table'
})
export class HRTaskDTO {
	@Field({
		description: 'The id of the task'
	})
	public id: string = '';

	@Field({
		description: 'The name of the task'
	})
	public name: string = '';

	@Field({
		description: 'The start of the task'
	})
	public start: Date = new Date();

	@Field({
		description: 'The end of the task'
	})
	public end: Date = new Date();

	@Field({
		description: 'Indicates whether organizers are allowed to self-assign'
	})
	public isLocked: boolean = false;

	@Field((_) => [HRSegmentDTO], {
		description: 'The segments of the task'
	})
	public segments?: HRSegmentDTO[];
}

@ObjectType({
	description: 'The data a HR table'
})
export class HRTableDTO {
	@Field({
		description: 'The id of the table'
	})
	public id: string = '';

	@Field({
		description: 'Indicates whether organizers are allowed to self-assign'
	})
	public isLocked: boolean = false;

	@Field((_) => [HRTaskDTO], {
		description: 'The tasks of the table'
	})
	public tasks?: HRTaskDTO[];
}

@InputType({
	description: 'The data of a segment of a HR table'
})
export class HRSegmentInput {
	@Field({
		description: 'The id of the segment',
		nullable: true
	})
	public id?: string;

	@Field({
		description: 'The capacity of the segment'
	})
	public capacity: number = 1;

	@Field({
		description: 'Indicates whether the job is required or not'
	})
	public isRequired: boolean = true;

	@Field({
		description: 'The start of the segment'
	})
	public start: Date = new Date();

	@Field({
		description: 'The end of the segment'
	})
	public end: Date = new Date();

	@Field({
		description: 'Indicates whether organizers are allowed to self-assign'
	})
	public isLocked: boolean = false;
}

@InputType({
	description: 'The data of a task of a HR table'
})
export class HRTaskInput {
	@Field({
		description: 'The id of the task',
		nullable: true
	})
	public id?: string;

	@Field({
		description: 'The name of the task'
	})
	public name: string = '';

	@Field({
		description: 'The start of the task'
	})
	public start: Date = new Date();

	@Field({
		description: 'The end of the task'
	})
	public end: Date = new Date();

	@Field({
		description: 'Indicates whether organizers are allowed to self-assign'
	})
	public isLocked: boolean = false;

	@Field((_) => [HRSegmentInput], {
		description: 'The segments of the task'
	})
	public segments!: HRSegmentInput[];
}

@InputType({
	description: 'The data a HR table'
})
export class HRTableInput {
	@Field({
		description: 'The id of the table',
		nullable: true
	})
	public id: string = '';

	@Field({
		description: 'Indicates whether organizers are allowed to self-assign'
	})
	public isLocked: boolean = false;

	@Field((_) => [HRTaskInput], {
		description: 'The tasks of the table'
	})
	public tasks!: HRTaskInput[];
}
