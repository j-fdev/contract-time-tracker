import type { NextFunction, Request, Response } from 'express';
import { getSession } from '@auth/express';

import { authConfig } from '../config/auth.config.js';
import { HttpError } from '../utils/http-error.js';

/** Rejects the request with 401 unless it carries a valid Auth.js session. */
export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
    const session = await getSession(req, authConfig);
    const user = session?.user;

    if (!user?.id || !user.email) {
        throw HttpError.unauthorized('Please log in.');
    }

    req.user = { id: user.id, email: user.email, name: user.name };
    next();
}

/** Returns the logged-in user. Only call it in routes protected by requireAuth. */
export function getAuthUser(req: Request) {
    if (!req.user) throw HttpError.unauthorized();
    return req.user;
}
