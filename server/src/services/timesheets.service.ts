import type { ObjectId } from 'mongodb';

import { AppDataSource } from '../db/data-source.js';
import { Timesheet } from '../entities/timesheet.entity.js';
import { getWeekPeriod, nowInSeconds } from '../utils/time.js';

const timesheetsRepository = () => AppDataSource.getMongoRepository(Timesheet);

/** Returns the weekly timesheet that a punch starting at `punchIn` belongs to, creating it if needed. */
export async function findOrCreateTimesheet(projectId: ObjectId, punchIn: number): Promise<Timesheet> {
    const { year, period } = getWeekPeriod(punchIn);

    const existingTimesheet = await timesheetsRepository().findOne({
        where: { project_id: projectId, year, week_period: period },
    });
    if (existingTimesheet) return existingTimesheet;

    const timesheet = timesheetsRepository().create({
        project_id: projectId,
        year,
        week_period: period,
        sum: 0,
        interval: 0,
        timestamp: nowInSeconds(),
    });
    return timesheetsRepository().save(timesheet);
}
