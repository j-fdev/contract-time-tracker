import type { Punch, PunchType } from '../types/punch';

interface TimeRange {
    start: number;
    end: number;
}

/** Seconds a punch lasted (running punches count until `now`), optionally clipped to a time range. */
export function getPunchDuration(punch: Punch, now: number, range?: TimeRange): number {
    const punchEnd = punch.punch_out || now;
    const start = range ? Math.max(punch.punch_in, range.start) : punch.punch_in;
    const end = range ? Math.min(punchEnd, range.end) : punchEnd;
    return Math.max(0, end - start);
}

/** Total seconds of one punch type (work or break). */
export function sumDurations(punches: Punch[], type: PunchType, now: number, range?: TimeRange): number {
    return punches
        .filter((punch) => punch.type === type)
        .reduce((total, punch) => total + getPunchDuration(punch, now, range), 0);
}

/** The punch that is still running, if any. */
export function findActivePunch(punches: Punch[]): Punch | undefined {
    return punches
        .filter((punch) => punch.punch_out === 0)
        .sort((a, b) => b.punch_in - a.punch_in)[0];
}

/**
 * When the current work session started. Breaks don't end a session:
 * a break starts the second the work punch stops, so consecutive punches share a timestamp.
 */
export function getSessionStart(punches: Punch[], activePunch: Punch): number {
    const sorted = [...punches].sort((a, b) => a.punch_in - b.punch_in);
    let index = sorted.findIndex((punch) => punch._id === activePunch._id);
    while (index > 0 && sorted[index - 1].punch_out === sorted[index].punch_in) {
        index -= 1;
    }
    return sorted[Math.max(index, 0)].punch_in;
}

export function filterByProject(punches: Punch[], projectId: string | undefined): Punch[] {
    return projectId ? punches.filter((punch) => punch.project_id === projectId) : [];
}
