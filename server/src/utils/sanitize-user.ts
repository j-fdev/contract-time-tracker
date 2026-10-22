import type { User } from '../entities/user.entity.js';

export type PublicUser = Omit<User, 'password'>;

/** Removes the password hash before a user is sent to the client. */
export function sanitizeUser(user: User): PublicUser {
    const { password: _password, ...publicUser } = user;
    return publicUser;
}
