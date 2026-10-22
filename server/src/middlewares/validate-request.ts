import type { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';

import { HttpError } from '../utils/http-error.js';

/** Runs after express-validator rules and stops the request with a 422 on the first invalid field. */
export function validateRequest(req: Request, _res: Response, next: NextFunction) {
    const result = validationResult(req);
    if (result.isEmpty()) return next();

    const [firstError] = result.array({ onlyFirstError: true });
    const field = firstError.type === 'field' ? firstError.path : undefined;
    throw new HttpError(422, String(firstError.msg), field);
}
