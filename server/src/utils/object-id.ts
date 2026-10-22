import { ObjectId } from 'mongodb';

import { HttpError } from './http-error.js';

/** Converts a string to a MongoDB ObjectId, or throws a 400 error if it is not a valid id. */
export function toObjectId(value: string, field = 'id'): ObjectId {
    if (!ObjectId.isValid(value)) {
        throw HttpError.badRequest(`Invalid ${field}.`, field);
    }
    return new ObjectId(value);
}
