import { body, param } from 'express-validator';

/** Blocks characters often used in injection attempts: \ / & [ ] { } < > */
export const SAFE_TEXT_PATTERN = /^[^\\/&[\]{}<>]*$/;
export const SAFE_TEXT_MESSAGE = 'Please do not use special characters like \\ / & [ ] { } < >.';

export const PHONE_PATTERN = /^\s*(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?\s*$/;

export const idParamRule = param('id').isMongoId().withMessage('Invalid id.');

/** A required, trimmed text field without special characters. */
export function requiredText(field: string, label: string) {
    return body(field)
        .isString().withMessage(`${label} is required.`)
        .trim()
        .notEmpty().withMessage(`${label} is required.`)
        .matches(SAFE_TEXT_PATTERN).withMessage(SAFE_TEXT_MESSAGE);
}

/** An optional, trimmed text field without special characters (empty string allowed). */
export function optionalText(field: string) {
    return body(field)
        .optional()
        .isString()
        .trim()
        .matches(SAFE_TEXT_PATTERN).withMessage(SAFE_TEXT_MESSAGE);
}
