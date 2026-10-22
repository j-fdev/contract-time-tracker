import { Router } from 'express';

import * as punchesController from '../controllers/punches.controller.js';
import { validateRequest } from '../middlewares/validate-request.js';
import {
    clockRules,
    createManualPunchRules,
    listPunchesRules,
    punchIdRules,
    updatePunchRules,
} from '../validators/punch.validators.js';

export const punchesRouter = Router();

punchesRouter.get('/', listPunchesRules, validateRequest, punchesController.listPunches);
punchesRouter.post('/clock', clockRules, validateRequest, punchesController.clock);
punchesRouter.post('/', createManualPunchRules, validateRequest, punchesController.createManualPunch);
punchesRouter.patch('/:id', updatePunchRules, validateRequest, punchesController.updatePunch);
punchesRouter.delete('/:id', punchIdRules, validateRequest, punchesController.deletePunch);
