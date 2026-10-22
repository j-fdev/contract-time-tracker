import type { Request, Response } from 'express';
import { matchedData } from 'express-validator';

import { getAuthUser } from '../middlewares/require-auth.js';
import * as punchesService from '../services/punches.service.js';
import { notifyPunchesChanged } from '../socket.js';
import type { ClockInput, CreateManualPunchInput, UpdatePunchInput } from '../types/punch.types.js';
import { toObjectId } from '../utils/object-id.js';

export async function listPunches(req: Request, res: Response) {
    const { projectId } = matchedData<{ projectId?: string }>(req, { locations: ['query'] });
    res.json({ data: await punchesService.listPunches(projectId) });
}

export async function clock(req: Request, res: Response) {
    const input = matchedData<ClockInput>(req, { locations: ['body'] });
    const { action, message, activePunch } = await punchesService.clock(input);
    notifyPunchesChanged(getAuthUser(req).id, input.project_id);
    res.json({ action, message, data: activePunch });
}

export async function createManualPunch(req: Request, res: Response) {
    const input = matchedData<CreateManualPunchInput>(req, { locations: ['body'] });
    const punch = await punchesService.createManualPunch(input);
    notifyPunchesChanged(getAuthUser(req).id, input.project_id);
    res.status(201).json({ data: punch, message: 'Punch added.' });
}

export async function updatePunch(req: Request, res: Response) {
    const input = matchedData<UpdatePunchInput>(req, { locations: ['body'] });
    const punch = await punchesService.updatePunch(toObjectId(String(req.params.id)), input);
    notifyPunchesChanged(getAuthUser(req).id, punch.project_id.toString());
    res.json({ data: punch, message: 'Punch updated.' });
}

export async function deletePunch(req: Request, res: Response) {
    await punchesService.deletePunch(toObjectId(String(req.params.id)));
    notifyPunchesChanged(getAuthUser(req).id);
    res.json({ message: 'Punch deleted.' });
}
