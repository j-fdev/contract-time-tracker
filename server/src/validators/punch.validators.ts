import { body, query } from 'express-validator';

import { PUNCH_TYPES } from '../types/punch.types.js';
import { idParamRule, optionalText } from './common.js';

const projectIdRule = () => body('project_id').isMongoId().withMessage('Please select a project.');
const punchTypeRule = () => body('type').isIn(PUNCH_TYPES).withMessage(`Punch type must be one of: ${PUNCH_TYPES.join(', ')}.`);
const timestampRule = (field: string) =>
    body(field).isInt({ min: 0 }).withMessage(`${field} must be a Unix timestamp in seconds.`).toInt();

export const listPunchesRules = [
    query('projectId').optional().isMongoId().withMessage('Invalid projectId.'),
];

export const clockRules = [projectIdRule(), punchTypeRule(), optionalText('notes')];

export const createManualPunchRules = [
    projectIdRule(),
    timestampRule('punch_in'),
    timestampRule('punch_out'),
    punchTypeRule().optional(),
    optionalText('notes'),
];

export const updatePunchRules = [
    idParamRule,
    timestampRule('punch_in').optional(),
    timestampRule('punch_out').optional(),
    punchTypeRule().optional(),
    optionalText('notes'),
];

export const punchIdRules = [idParamRule];
