/** Error thrown for any non-2xx API response. `field` is set when the server rejected a specific input. */
export class ApiError extends Error {
    constructor(
        message: string,
        public readonly status: number,
        public readonly field?: string,
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

export interface ApiResponse<T> {
    data: T;
    message?: string;
}

interface RequestOptions {
    method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
    body?: unknown;
}

/** Calls the backend through the Vite proxy (/api) with the session cookie. */
export async function apiRequest<T>(path: string, { method = 'GET', body }: RequestOptions = {}): Promise<T> {
    const response = await fetch(`/api${path}`, {
        method,
        credentials: 'include',
        headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
        body: body === undefined ? undefined : JSON.stringify(body),
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new ApiError(payload.message ?? `Request failed (${response.status}).`, response.status, payload.field);
    }
    return payload as T;
}

/** Turns any thrown value into a message that can be shown to the user. */
export function getErrorMessage(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
    return error instanceof Error && error.message ? error.message : fallback;
}
