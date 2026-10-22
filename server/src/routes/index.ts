import { Router } from 'express';

import { requireAuth } from '../middlewares/require-auth.js';
import { projectsRouter } from './projects.routes.js';
import { punchesRouter } from './punches.routes.js';
import { usersRouter } from './users.routes.js';

/** Every route in here requires a logged-in user. */
export const apiRouter = Router();

apiRouter.use(requireAuth);
apiRouter.use('/users', usersRouter);
apiRouter.use('/projects', projectsRouter);
apiRouter.use('/punches', punchesRouter);
