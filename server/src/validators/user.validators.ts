import { body } from 'express-validator';

import { USER_ROLES } from '../types/user.types.js';
import { PHONE_PATTERN, idParamRule, optionalText, requiredText } from './common.js';

const STRONG_PASSWORD_OPTIONS = { minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 };
const STRONG_PASSWORD_MESSAGE = 'Password must be at least 8 characters and include an uppercase letter, a lowercase letter, a number and a symbol.';

const emailRule = () => body('email').isString().trim().toLowerCase().isEmail().withMessage('Please provide a valid email, e.g. name@example.com.');
const phoneRule = () => body('phone_number').isString().trim().matches(PHONE_PATTERN).withMessage('Please provide a valid phone number, e.g. 1-514-111-1111.');
const roleRule = () => body('type').optional().isIn(USER_ROLES).withMessage('Invalid user type.');

export const createUserRules = [
    requiredText('first_name', 'First name'),
    requiredText('last_name', 'Last name'),
    emailRule(),
    phoneRule(),
    optionalText('city'),
    roleRule(),
    // Only admins log in, so only admins need a password.
    body('password')
        .if(body('type').equals('Admin'))
        .isStrongPassword(STRONG_PASSWORD_OPTIONS).withMessage(STRONG_PASSWORD_MESSAGE),
];

export const updateUserRules = [
    idParamRule,
    requiredText('first_name', 'First name').optional(),
    requiredText('last_name', 'Last name').optional(),
    emailRule().optional(),
    phoneRule().optional(),
    optionalText('city'),
    roleRule(),
    body('disabled').optional().isBoolean().withMessage('disabled must be true or false.').toBoolean(),
    // An empty password means "keep the current one".
    body('password').optional({ values: 'falsy' }).isStrongPassword(STRONG_PASSWORD_OPTIONS).withMessage(STRONG_PASSWORD_MESSAGE),
];

export const userIdRules = [idParamRule];
