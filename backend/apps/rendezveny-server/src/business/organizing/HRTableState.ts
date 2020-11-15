import { Organizer } from '../../data/models/Organizer';

export interface HRTableSegmentState {
	id: string;
	capacity: number;
	isRequired: boolean;
	start: Date;
	end: Date;
	isLocked: boolean;
	organizers: Organizer[];
}

export interface HRTableTaskState {
	id: string;
	name: string;
	start: Date;
	end: Date;
	isLocked: boolean;
	segments: HRTableSegmentState[];
}

export interface HRTableState {
	id: string;
	isLocked: boolean;
	tasks: HRTableTaskState[];
}

export interface HRTableSegmentModifiedStructure {
	id?: string;
	capacity: number;
	isRequired: boolean;
	start: Date;
	end: Date;
	isLocked: boolean;
}

export interface HRTableTaskModifiedStructure {
	id?: string;
	name: string;
	start: Date;
	end: Date;
	isLocked: boolean;
	segments: HRTableSegmentModifiedStructure[];
}

export interface HRTableModifiedStructure {
	id?: string;
	isLocked: boolean;
	tasks: HRTableTaskModifiedStructure[];
}