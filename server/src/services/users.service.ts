import bcrypt from 'bcryptjs';
import type { ObjectId } from 'mongodb';

import { AppDataSource } from '../db/data-source.js';
import { User } from '../entities/user.entity.js';
import type { CreateUserInput, UpdateUserInput } from '../types/user.types.js';
import { HttpError } from '../utils/http-error.js';
import { sanitizeUser, type PublicUser } from '../utils/sanitize-user.js';
import { nowInSeconds } from '../utils/time.js';

const PASSWORD_SALT_ROUNDS = 12;

const usersRepository = () => AppDataSource.getMongoRepository(User);

async function findUserOrThrow(id: ObjectId): Promise<User> {
    const user = await usersRepository().findOne({ where: { _id: id } });
    if (!user) throw HttpError.notFound('User not found.');
    return user;
}

async function assertEmailAvailable(email: string, currentUserId?: ObjectId) {
    const existingUser = await usersRepository().findOne({ where: { email } });
    const isSameRecord = currentUserId !== undefined && existingUser?._id.equals(currentUserId);
    if (existingUser && !isSameRecord) {
        throw HttpError.conflict('This email is already used by another user.', 'email');
    }
}

export async function listUsers(): Promise<PublicUser[]> {
    const users = await usersRepository().find({ order: { last_name: 'ASC', first_name: 'ASC' } });
    return users.map(sanitizeUser);
}

export async function getUserById(id: ObjectId): Promise<PublicUser> {
    return sanitizeUser(await findUserOrThrow(id));
}

export async function createUser(input: CreateUserInput): Promise<PublicUser> {
    await assertEmailAvailable(input.email);

    const type = input.type ?? 'Client';
    const user = usersRepository().create({
        first_name: input.first_name,
        last_name: input.last_name,
        email: input.email,
        phone_number: input.phone_number,
        city: input.city ?? '',
        type,
        disabled: false,
        timestamp: nowInSeconds(),
    });

    if (type === 'Admin' && input.password) {
        user.password = await bcrypt.hash(input.password, PASSWORD_SALT_ROUNDS);
    }

    return sanitizeUser(await usersRepository().save(user));
}

export async function updateUser(id: ObjectId, input: UpdateUserInput): Promise<PublicUser> {
    const user = await findUserOrThrow(id);
    if (input.email && input.email !== user.email) {
        await assertEmailAvailable(input.email, user._id);
    }

    const { password, ...fields } = input;
    const changes: Partial<User> = { ...fields };
    const nextType = input.type ?? user.type;

    if (password && nextType === 'Admin') {
        changes.password = await bcrypt.hash(password, PASSWORD_SALT_ROUNDS);
    }

    await usersRepository().update({ _id: id }, changes);
    return getUserById(id);
}

export async function deleteUser(id: ObjectId, currentUserId: string): Promise<void> {
    if (id.toString() === currentUserId) {
        throw HttpError.badRequest('You cannot delete your own account.');
    }
    await findUserOrThrow(id);
    await usersRepository().deleteOne({ _id: id });
}
