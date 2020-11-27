import { InjectRepository } from '@nestjs/typeorm';
import { HRTable } from '../../data/models/HRTable';
import { HRTask } from '../../data/models/HRTask';
import { HRSegment } from '../../data/models/HRSegment';
import { AuthContext, AuthEvent, AuthorizeGuard, IsChiefOrganizer, IsOrganizer } from '../auth/AuthorizeGuard';
import { EventContext } from '../auth/tokens/EventToken';
import { Event } from '../../data/models/Event';
import { HRTableModifiedStructure, HRTableState, HRTableTaskModifiedStructure } from './HRTableState';
import { HRTableDoesNotExistsException } from './exceptions/HRTableDoesNotExistsException';
import { nameof } from '../../utils/nameof';
import { HRTableInvalidStructureException } from './exceptions/HRTableInvalidStructureException';
import { BaseManager, Manager } from '../utils/BaseManager';
import {
	EventRepository,
	HRSegmentRepository,
	HRTableRepository,
	HRTaskRepository,
	OrganizerRepository
} from '../../data/repositories/repositories';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { HRTableAlreadyExistsException } from './exceptions/HRTableAlreadyExistsException';

@Manager()
export class HRTableManager extends BaseManager {
	public constructor(
		@InjectRepository(EventRepository) private readonly eventRepository: EventRepository,
		@InjectRepository(HRTableRepository) private readonly hrTableRepository: HRTableRepository,
		@InjectRepository(HRTaskRepository) private readonly hrTaskRepository: HRTaskRepository,
		@InjectRepository(HRSegmentRepository) private readonly hrSegmentRepository: HRSegmentRepository,
		@InjectRepository(OrganizerRepository) private readonly organizerRepository: OrganizerRepository,
	) {
		super();
	}

	@AuthorizeGuard(IsOrganizer())
	public async getHRTable(
		@AuthContext() _eventContext: EventContext,
		@AuthEvent() event: Event,
	): Promise<HRTableState | undefined> {
		const hrTable = await this.hrTableRepository.findOne({ event }, {
			relations: [
				`${nameof<HRTable>('hrTasks')}`,
				`${nameof<HRTable>('hrTasks')}.${nameof<HRTask>('hrSegments')}`,
				`${nameof<HRTable>('hrTasks')}.${nameof<HRTask>('hrSegments')}.${nameof<HRSegment>('organizers')}`
			]
		});
		if(!hrTable) {
			return undefined;
		}

		return this.returnHrTableState(hrTable);
	}

	@Transactional()
	@AuthorizeGuard(IsChiefOrganizer())
	public async createHRTable(
		@AuthContext() eventContext: EventContext,
		@AuthEvent() event: Event,
		hrTableStructure: HRTableModifiedStructure
	): Promise<HRTableState> {
		await event.loadRelation(this.eventRepository, 'hrTable');
		if(event.hrTable) {
			throw new HRTableAlreadyExistsException();
		}

		const hrTable = new HRTable({ isLocked: false, event: event });
		await this.hrTableRepository.save(hrTable);

		return this.modifyHRTable(eventContext, event, hrTableStructure);
	}

	@Transactional()
	@AuthorizeGuard(IsChiefOrganizer())
	public async modifyHRTable(
		@AuthContext() _eventContext: EventContext,
		@AuthEvent() event: Event,
		hrTableStructure: HRTableModifiedStructure
	): Promise<HRTableState> {
		const hrTable = await this.hrTableRepository.findOne({ event }, {
			relations: [
				`${nameof<HRTable>('hrTasks')}`,
				`${nameof<HRTable>('hrTasks')}.${nameof<HRTask>('hrSegments')}`,
				`${nameof<HRTable>('hrTasks')}.${nameof<HRTask>('hrSegments')}.${nameof<HRSegment>('organizers')}`
			]
		});
		if(!hrTable) {
			throw new HRTableDoesNotExistsException(event.id);
		}

		const deletedTasks = hrTable.hrTasks.filter(
			task => !hrTableStructure.tasks.map(t => t.id).some(id => id === task.id)
		);
		await this.hrTaskRepository.remove(deletedTasks);

		const modifiedTasks: HRTask[] = [];
		for(const task of hrTableStructure.tasks) {
			if(typeof task.id === 'string') {
				const origTask = hrTable.hrTasks.find(t => t.id === task.id);
				if(origTask) {
					modifiedTasks.push(await this.modifyTask(origTask, task));
				}
				else {
					throw new HRTableInvalidStructureException();
				}
			}
			else {
				modifiedTasks.push(await this.createTask(hrTable, task));
			}
		}

		for(const [idx, task] of modifiedTasks.entries()) {
			task.order = idx;
		}

		await this.hrTaskRepository.save(modifiedTasks);

		hrTable.isLocked = hrTableStructure.isLocked;
		hrTable.hrTasks = modifiedTasks;
		await this.hrTableRepository.save(hrTable);

		return this.returnHrTableState(hrTable);
	}

	@Transactional()
	@AuthorizeGuard(IsChiefOrganizer())
	public async deleteHRTable(
		@AuthContext() _eventContext: EventContext,
		@AuthEvent() event: Event
	): Promise<void> {
		await event.loadRelation(this.eventRepository, 'hrTable');
		if(!event.hrTable) {
			throw new HRTableDoesNotExistsException(event.id);
		}

		await this.hrTableRepository.remove(event.hrTable);
	}

	private async modifyTask(
		origTask: HRTask, task: HRTableTaskModifiedStructure
	): Promise<HRTask> {
		origTask.name = task.name;
		origTask.start = task.start;
		origTask.end = task.end;
		origTask.isLocked = task.isLocked;

		const deletedSegments = origTask.hrSegments.filter(
			segment => !task.segments.map(s => s.id).some(id => id === segment.id)
		);
		await this.hrSegmentRepository.remove(deletedSegments);

		const modifiedSegments: HRSegment[] = [];
		for(const segment of task.segments) {
			if(typeof segment.id === 'string') {
				const origSegment = origTask.hrSegments.find(s => s.id === segment.id);
				if(origSegment) {
					origSegment.capacity = segment.capacity;
					origSegment.isRequired = segment.isRequired;
					origSegment.start = segment.start;
					origSegment.end = segment.end;
					origSegment.isLocked = segment.isLocked;
					modifiedSegments.push(origSegment);
				}
				else {
					throw new HRTableInvalidStructureException();
				}
			}
			else {
				modifiedSegments.push(new HRSegment({
					capacity: segment.capacity,
					isRequired: segment.isRequired,
					start: segment.start,
					end: segment.end,
					isLocked: segment.isLocked,
					hrTask: origTask
				}));
			}
		}

		await this.hrSegmentRepository.save(modifiedSegments);

		origTask.hrSegments = modifiedSegments;

		return origTask;
	}

	private async createTask(
		hrTable: HRTable, task: HRTableTaskModifiedStructure
	): Promise<HRTask> {
		const newTask = new HRTask({
			name: task.name,
			start: task.start,
			end: task.end,
			isLocked: task.isLocked,
			order: -1,
			hrTable: hrTable
		});
		await this.hrTaskRepository.save(newTask);

		const newSegments: HRSegment[] = [];
		for(const segment of task.segments) {
			newSegments.push(new HRSegment({
				capacity: segment.capacity,
				start: segment.start,
				end: segment.end,
				isRequired: segment.isRequired,
				isLocked: segment.isLocked,
				hrTask: newTask
			}));
		}
		await this.hrSegmentRepository.save(newSegments);

		newTask.hrSegments = newSegments;

		return newTask;
	}

	private returnHrTableState(hrTable: HRTable): HRTableState {
		return {
			id: hrTable.id,
			isLocked: hrTable.isLocked,
			tasks: hrTable.hrTasks.sort((t1, t2) => t1.order - t2.order).map(task => ({
				id: task.id,
				name: task.id,
				start: task.start,
				end: task.end,
				isLocked: task.isLocked,
				segments: task.hrSegments.map(segment => ({
					id: segment.id,
					isRequired: segment.isRequired,
					start: segment.start,
					end: segment.end,
					capacity: segment.capacity,
					isLocked: segment.isLocked,
					organizers: segment.organizers
				}))
			}))
		};
	}
}