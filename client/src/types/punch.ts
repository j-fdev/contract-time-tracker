export type PunchType = 'in' | 'break';

export interface Punch {
    _id: string;
    project_id: string;
    timesheet_id: string;
    punch_in: number;
    punch_out: number;
    type: PunchType;
    notes: string;
    timestamp: number;
}

export type ClockAction = 'CLOCK_IN' | 'CLOCK_OUT' | 'START_BREAK' | 'END_BREAK';
