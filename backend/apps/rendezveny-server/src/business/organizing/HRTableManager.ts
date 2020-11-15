import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Organizer } from '../../data/models/Organizer';
import { Repository, Transaction, TransactionRepository } from 'typeorm';
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

@Injectable()
export class HRTableManager {
	public constructor(
		@InjectRepository(HRTable) private readonly hrTableRepository: Repository<HRTable>,
		@InjectRepository(HRTask) private readonly hrTaskRepository: Repository<HRTask>,
		@InjectRepository(HRSegment) private readonly hrSegmentRepository: Repository<HRSegment>,
		@InjectRepository(Organizer) private readonly organizerRepository: Repository<Organizer>,
	) {
	}

	@AuthorizeGuard(IsOrganizer())
	public async getHRTable(
		@AuthContext() _eventContext: EventContext,
		@AuthEvent() event: Event,
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

		return this.returnHrTableState(hrTable);
	}

	@Transaction()
	@AuthorizeGuard(IsChiefOrganizer())
	public async modifyHRTable(
		@AuthContext() _eventContext: EventContext,
		@AuthEvent() event: Event,
		hrTableStructure: HRTableModifiedStructure,
		@TransactionRepository(HRTable) hrTableRepository?: Repository<HRTable>,
		@TransactionRepository(HRTask) hrTaskRepository?: Repository<HRTask>,
		@TransactionRepository(HRSegment) hrSegmentRepository?: Repository<HRSegment>
	): Promise<HRTableState> {
		const hrTable = await hrTableRepository!.findOne({ event }, {
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
		await hrTaskRepository!.remove(deletedTasks);

		const modifiedTasks: HRTask[] = [];
		for(const task of hrTableStructure.tasks) {
			if(typeof task.id === 'string') {
				const origTask = hrTable.hrTasks.find(t => t.id === task.id);
				if(origTask) {
					modifiedTasks.push(await this.modifyTask(origTask, task, hrSegmentRepository!));
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

		await hrTaskRepository!.save(modifiedTasks);

		hrTable.isLocked = hrTableStructure.isLocked;
		await hrTableRepository!.save(hrTable);

		return this.returnHrTableState(hrTable);
	}

	private async modifyTask(
		origTask: HRTask, task: HRTableTaskModifiedStructure,
		hrSegmentRepository: Repository<HRSegment>
	): Promise<HRTask> {
		origTask.name = task.name;
		origTask.start = task.start;
		origTask.end = task.end;
		origTask.isLocked = task.isLocked;

		const deletedSegments = origTask.hrSegments.filter(
			segment => !task.segments.map(s => s.id).some(id => id === segment.id)
		);
		await hrSegmentRepository.remove(deletedSegments);

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

		await hrSegmentRepository.save(modifiedSegments);

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