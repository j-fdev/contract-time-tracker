/** An error that carries an HTTP status code. Thrown by services, handled by the error middleware. */
export class HttpError extends Error {
    constructor(
        public readonly status: number,
        message: string,
        public readonly field?: string,
    ) {
        super(message);
        this.name = 'HttpError';
    }

    static badRequest(message: string, field?: string) {
        return new HttpError(400, message, field);
    }

    static unauthorized(message = 'Unauthorized') {
        return new HttpError(401, message);
    }

    static notFound(message: string) {
        return new HttpError(404, message);
    }

    static conflict(message: string, field?: string) {
        return new HttpError(409, message, field);
    }
}
