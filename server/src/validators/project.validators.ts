import { body } from 'express-validator';

import { idParamRule, optionalText, requiredText } from './common.js';

const clientIdRule = () => body('client_id').isMongoId().withMessage('Please select a client.');
const hourRateRule = () => body('hour_rate').isFloat({ min: 0 }).withMessage('Hourly rate must be a positive number, e.g. 45 or 62.5.').toFloat();
const activeRule = () => body('active').optional().isBoolean().withMessage('active must be true or false.').toBoolean();

export const createProjectRules = [
    clientIdRule(),
    requiredText('project_name', 'Project name'),
    requiredText('description', 'Description'),
    optionalText('notes'),
    hourRateRule(),
    activeRule(),
];

export const updateProjectRules = [
    idParamRule,
    clientIdRule().optional(),
    requiredText('project_name', 'Project name').optional(),
    requiredText('description', 'Description').optional(),
    optionalText('notes'),
    hourRateRule().optional(),
    activeRule(),
];

export const projectIdRules = [idParamRule];
