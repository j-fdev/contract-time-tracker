import type { Punch } from '../entities/punch.entity.js';

export type PunchType = 'in' | 'break';

export const PUNCH_TYPES: readonly PunchType[] = ['in', 'break'];

export type ClockAction = 'CLOCK_IN' | 'CLOCK_OUT' | 'START_BREAK' | 'END_BREAK';

export interface ClockInput {
    project_id: string;
    type: PunchType;
    notes?: string;
}

export interface ClockResult {
    action: ClockAction;
    message: string;
    /** The punch that is currently running, or null when the user is clocked out. */
    activePunch: Punch | null;
}

export interface CreateManualPunchInput {
    project_id: string;
    punch_in: number;
    punch_out: number;
    type?: PunchType;
    notes?: string;
}

export type UpdatePunchInput = Partial<Pick<CreateManualPunchInput, 'punch_in' | 'punch_out' | 'type' | 'notes'>>;
