import bcrypt from 'bcryptjs';

import { AppDataSource } from '../db/data-source.js';
import { User } from '../entities/user.entity.js';
import type { AuthUser } from '../types/user.types.js';

/** Returns the user if the email/password pair is valid and the account is enabled, otherwise null. */
export async function verifyCredentials(email: string, password: string): Promise<AuthUser | null> {
    const user = await AppDataSource.getMongoRepository(User).findOne({
        where: { email: email.trim().toLowerCase() },
        select: ['_id', 'email', 'first_name', 'last_name', 'password', 'disabled'],
    });

    if (!user?.password || user.disabled) return null;

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return null;

    return {
        id: user._id.toString(),
        email: user.email,
        name: `${user.first_name} ${user.last_name}`.trim(),
    };
}
