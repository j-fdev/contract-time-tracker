export function nowInSeconds(): number {
    return Math.floor(Date.now() / 1000);
}

/** Accepts seconds or milliseconds (older records were saved in ms). */
function toDate(timestamp: number): Date {
    return new Date(timestamp > 1e11 ? timestamp : timestamp * 1000);
}

/** 3725 -> "01:02:05" */
export function formatDuration(totalSeconds: number): string {
    const seconds = Math.max(0, Math.floor(totalSeconds));
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const rest = seconds % 60;
    return [hours, minutes, rest].map((part) => String(part).padStart(2, '0')).join(':');
}

export function formatTime(timestamp: number): string {
    return toDate(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function formatDate(timestamp: number): string {
    return toDate(timestamp).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
}

/** Today's local start and end, in Unix seconds. */
export function getTodayRange(): { start: number; end: number } {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    return { start: start.getTime() / 1000, end: end.getTime() / 1000 };
}
