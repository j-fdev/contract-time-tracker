export type PunchType = 'in' | 'break';

export interface Punch {
    _id: string;
    project_id: string;
    timesheet_id: string;
    /** Unix seconds. */
    punch_in: number;
    /** Unix seconds, 0 while the punch is running. */
    punch_out: number;
    type: PunchType;
    notes: string;
    timestamp: number;
}

export type ClockAction = 'CLOCK_IN' | 'CLOCK_OUT' | 'START_BREAK' | 'END_BREAK';
