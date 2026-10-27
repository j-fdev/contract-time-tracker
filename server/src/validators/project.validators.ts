import { body } from 'express-validator';

import { idParamRule, optionalText, requiredText } from './common.js';

const clientIdRule = () => body('client_id').isMongoId().withMessage('Please select a client.');
const hourRateRule = () => body('hour_rate').isFloat({ min: 0 }).withMessage('Hourly rate must be a positive number, e.g. 45 or 62.5.').toFloat();
// A Windows folder path: backslashes and colons are fine, but not the characters Windows forbids in paths.
const folderPathRule = () =>
    body('folder_path')
        .optional()
        .isString()
        .trim()
        .isLength({ max: 260 }).withMessage('The folder path is too long (260 characters max).')
        .matches(/^[^<>"|?*\x00-\x1F]*$/).withMessage('The folder path contains characters that are not allowed: < > " | ? *');
const activeRule = () => body('active').optional().isBoolean().withMessage('active must be true or false.').toBoolean();

export const createProjectRules = [
    clientIdRule(),
    requiredText('project_name', 'Project name'),
    requiredText('description', 'Description'),
    optionalText('notes'),
    hourRateRule(),
    folderPathRule(),
    activeRule(),
];

export const updateProjectRules = [
    idParamRule,
    clientIdRule().optional(),
    requiredText('project_name', 'Project name').optional(),
    requiredText('description', 'Description').optional(),
    optionalText('notes'),
    hourRateRule().optional(),
    folderPathRule(),
    activeRule(),
];

export const projectIdRules = [idParamRule];
