import type { ObjectId } from 'mongodb';

import { AppDataSource } from '../db/data-source.js';
import { Punch } from '../entities/punch.entity.js';
import type {
    ClockInput,
    ClockResult,
    CreateManualPunchInput,
    PunchType,
    UpdatePunchInput,
} from '../types/punch.types.js';
import { HttpError } from '../utils/http-error.js';
import { toObjectId } from '../utils/object-id.js';
import { nowInSeconds } from '../utils/time.js';
import { findProjectOrThrow } from './projects.service.js';
import { findOrCreateTimesheet } from './timesheets.service.js';

const punchesRepository = () => AppDataSource.getMongoRepository(Punch);

async function findPunchOrThrow(id: ObjectId): Promise<Punch> {
    const punch = await punchesRepository().findOne({ where: { _id: id } });
    if (!punch) throw HttpError.notFound('Punch not found.');
    return punch;
}

/** The punch that is still running for a project (punch_out === 0), if any. */
async function findActivePunch(projectId: ObjectId): Promise<Punch | null> {
    return punchesRepository().findOne({
        where: { project_id: projectId, punch_out: 0 },
        order: { punch_in: 'DESC' },
    });
}

async function startPunch(projectId: ObjectId, type: PunchType, startedAt: number, notes = ''): Promise<Punch> {
    const timesheet = await findOrCreateTimesheet(projectId, startedAt);
    const punch = punchesRepository().create({
        project_id: projectId,
        timesheet_id: timesheet._id,
        punch_in: startedAt,
        punch_out: 0,
        type,
        notes,
        timestamp: nowInSeconds(),
    });
    return punchesRepository().save(punch);
}

async function stopPunch(punch: Punch, stoppedAt: number, notes?: string): Promise<void> {
    const changes: Partial<Punch> = { punch_out: stoppedAt };
    if (notes) changes.notes = notes;
    await punchesRepository().update({ _id: punch._id }, changes);
}

function assertValidRange(punchIn: number, punchOut: number) {
    if (punchOut !== 0 && punchOut <= punchIn) {
        throw HttpError.badRequest('The end time must be after the start time.', 'punch_out');
    }
}

export async function listPunches(projectId?: string): Promise<Punch[]> {
    const where = projectId ? { project_id: toObjectId(projectId, 'projectId') } : {};
    return punchesRepository().find({ where, order: { punch_in: 'ASC' } });
}

/**
 * The punch clock. What happens depends on the requested action and on the punch currently running:
 *
 * | request | running punch | result                                   |
 * |---------|---------------|------------------------------------------|
 * | in      | none          | start work                (CLOCK_IN)     |
 * | in      | work          | stop work                 (CLOCK_OUT)    |
 * | in      | break         | refused: end the break first             |
 * | break   | none          | refused: clock in first                  |
 * | break   | work          | stop work, start break    (START_BREAK)  |
 * | break   | break         | stop break, resume work   (END_BREAK)    |
 */
export async function clock(input: ClockInput): Promise<ClockResult> {
    const projectId = toObjectId(input.project_id, 'project_id');
    await findProjectOrThrow(projectId);

    const now = nowInSeconds();
    const activePunch = await findActivePunch(projectId);

    if (input.type === 'in') {
        if (!activePunch) {
            const punch = await startPunch(projectId, 'in', now, input.notes);
            return { action: 'CLOCK_IN', message: 'You are clocked in.', activePunch: punch };
        }
        if (activePunch.type === 'break') {
            throw HttpError.conflict('Please end your break first.');
        }
        await stopPunch(activePunch, now, input.notes);
        return { action: 'CLOCK_OUT', message: 'You are clocked out.', activePunch: null };
    }

    if (!activePunch) {
        throw HttpError.conflict('Please clock in before starting a break.');
    }

    await stopPunch(activePunch, now);
    if (activePunch.type === 'in') {
        const breakPunch = await startPunch(projectId, 'break', now, input.notes);
        return { action: 'START_BREAK', message: 'Your break has started.', activePunch: breakPunch };
    }

    const workPunch = await startPunch(projectId, 'in', now);
    return { action: 'END_BREAK', message: 'Your break has ended.', activePunch: workPunch };
}

/** Adds a completed punch after the fact (e.g. a forgotten clock-in). */
export async function createManualPunch(input: CreateManualPunchInput): Promise<Punch> {
    assertValidRange(input.punch_in, input.punch_out);

    const projectId = toObjectId(input.project_id, 'project_id');
    await findProjectOrThrow(projectId);

    const timesheet = await findOrCreateTimesheet(projectId, input.punch_in);
    const punch = punchesRepository().create({
        project_id: projectId,
        timesheet_id: timesheet._id,
        punch_in: input.punch_in,
        punch_out: input.punch_out,
        type: input.type ?? 'in',
        notes: input.notes ?? '',
        timestamp: nowInSeconds(),
    });
    return punchesRepository().save(punch);
}

export async function updatePunch(id: ObjectId, input: UpdatePunchInput): Promise<Punch> {
    const punch = await findPunchOrThrow(id);
    assertValidRange(input.punch_in ?? punch.punch_in, input.punch_out ?? punch.punch_out);

    const changes: Partial<Punch> = { ...input };
    if (input.punch_in !== undefined && input.punch_in !== punch.punch_in) {
        changes.timesheet_id = (await findOrCreateTimesheet(punch.project_id, input.punch_in))._id;
    }

    await punchesRepository().update({ _id: id }, changes);
    return findPunchOrThrow(id);
}

export async function deletePunch(id: ObjectId): Promise<void> {
    await findPunchOrThrow(id);
    await punchesRepository().deleteOne({ _id: id });
}
