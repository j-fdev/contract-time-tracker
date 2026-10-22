import { ExpressAuth } from '@auth/express';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';

import { authConfig } from './config/auth.config.js';
import { env } from './config/env.js';
import { errorHandler, notFoundHandler } from './middlewares/error-handler.js';
import { apiRouter } from './routes/index.js';

export function createApp() {
    const app = express();

    app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
    app.use(cors({ origin: env.clientOrigin, credentials: true }));
    app.use(express.json());
    app.use(express.urlencoded({ extended: true })); // Auth.js sign-in forms are url-encoded

    app.get('/api/health', (_req, res) => {
        res.json({ status: 'ok' });
    });

    app.use('/api/auth', ExpressAuth(authConfig));
    app.use('/api', apiRouter);

    app.use(notFoundHandler);
    app.use(errorHandler);

    return app;
}
