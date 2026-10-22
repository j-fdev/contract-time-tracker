import type { NextFunction, Request, Response } from 'express';

import { HttpError } from '../utils/http-error.js';

export function notFoundHandler(req: Request, res: Response) {
    res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

/** Single place where errors become HTTP responses. Express 5 forwards rejected promises here. */
export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction) {
    if (error instanceof HttpError) {
        res.status(error.status).json({ message: error.message, field: error.field });
        return;
    }

    if (error instanceof SyntaxError && 'body' in error) {
        res.status(400).json({ message: 'Malformed JSON body.' });
        return;
    }

    console.error('[error]', error);
    res.status(500).json({ message: 'Internal server error.' });
}
