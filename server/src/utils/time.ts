const DAY_MS = 24 * 60 * 60 * 1000;
const WEEK_MS = 7 * DAY_MS;

/** Current Unix time in seconds (the unit used for every timestamp in the database). */
export function nowInSeconds(): number {
    return Math.floor(Date.now() / 1000);
}

/** Midnight (local time) of the Monday that starts the week containing `date`. */
function startOfWeek(date: Date): Date {
    const monday = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const daysSinceMonday = (monday.getDay() + 6) % 7;
    monday.setDate(monday.getDate() - daysSinceMonday);
    return monday;
}

/** Midnight (local time) of the first Monday on or after January 1st. */
function firstMondayOfYear(year: number): Date {
    const date = new Date(year, 0, 1);
    const daysUntilMonday = (8 - date.getDay()) % 7;
    date.setDate(date.getDate() + daysUntilMonday);
    return date;
}

export interface WeekPeriod {
    /** Year the week belongs to (the year of its Monday). */
    year: number;
    /** 0-based week index counted from the first Monday of that year. */
    period: number;
}

/**
 * Returns the Monday-to-Sunday week a timestamp (in seconds) falls into.
 * Days before the first Monday of January belong to the last week of the previous year.
 */
export function getWeekPeriod(timestampInSeconds: number): WeekPeriod {
    const weekStart = startOfWeek(new Date(timestampInSeconds * 1000));
    const year = weekStart.getFullYear();
    const period = Math.round((weekStart.getTime() - firstMondayOfYear(year).getTime()) / WEEK_MS);
    return { year, period };
}
