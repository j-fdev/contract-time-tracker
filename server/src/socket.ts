import type { Server as HttpServer } from 'node:http';
import { decode } from '@auth/core/jwt';
import { parse as parseCookies } from 'cookie';
import { Server, type Socket } from 'socket.io';

import { env } from './config/env.js';

const SESSION_COOKIE_NAMES = ['__Secure-authjs.session-token', 'authjs.session-token'];

let io: Server | undefined;

/** Lets only logged-in users open a socket, using the same Auth.js session cookie as the REST API. */
async function authenticateSocket(socket: Socket, next: (error?: Error) => void) {
    try {
        const cookies = parseCookies(socket.handshake.headers.cookie ?? '');
        const cookieName = SESSION_COOKIE_NAMES.find((name) => cookies[name]);
        if (!cookieName) return next(new Error('Unauthorized'));

        // Auth.js uses the cookie name as the salt when it encrypts the session token.
        const token = await decode({ token: cookies[cookieName], secret: env.authSecret, salt: cookieName });
        if (!token?.sub) return next(new Error('Unauthorized'));

        socket.data.userId = token.sub;
        next();
    } catch {
        next(new Error('Unauthorized'));
    }
}

export function initializeSocket(server: HttpServer): Server {
    io = new Server(server, {
        cors: { origin: env.clientOrigin, credentials: true },
    });

    io.use(authenticateSocket);
    io.on('connection', (socket) => {
        // One room per user, so events reach every tab that user has open.
        socket.join(socket.data.userId as string);
    });

    return io;
}

/** Tells the user's open tabs that punches changed, so they can refresh their data. */
export function notifyPunchesChanged(userId: string, projectId?: string) {
    io?.to(userId).emit('punches:changed', { projectId });
}
