import type { Request, Response } from 'express';
import { matchedData } from 'express-validator';

import { getAuthUser } from '../middlewares/require-auth.js';
import * as usersService from '../services/users.service.js';
import type { CreateUserInput, UpdateUserInput } from '../types/user.types.js';
import { toObjectId } from '../utils/object-id.js';

export async function listUsers(_req: Request, res: Response) {
    res.json({ data: await usersService.listUsers() });
}

export async function getCurrentUser(req: Request, res: Response) {
    const { id } = getAuthUser(req);
    res.json({ data: await usersService.getUserById(toObjectId(id)) });
}

export async function getUser(req: Request, res: Response) {
    const user = await usersService.getUserById(toObjectId(String(req.params.id)));
    res.json({ data: user });
}

export async function createUser(req: Request, res: Response) {
    const input = matchedData<CreateUserInput>(req, { locations: ['body'] });
    const user = await usersService.createUser(input);
    res.status(201).json({ data: user, message: 'User created.' });
}

export async function updateUser(req: Request, res: Response) {
    const input = matchedData<UpdateUserInput>(req, { locations: ['body'] });
    const user = await usersService.updateUser(toObjectId(String(req.params.id)), input);
    res.json({ data: user, message: 'User updated.' });
}

export async function deleteUser(req: Request, res: Response) {
    await usersService.deleteUser(toObjectId(String(req.params.id)), getAuthUser(req).id);
    res.json({ message: 'User deleted.' });
}
