import { Router } from 'express';

import * as usersController from '../controllers/users.controller.js';
import { validateRequest } from '../middlewares/validate-request.js';
import { createUserRules, updateUserRules, userIdRules } from '../validators/user.validators.js';

export const usersRouter = Router();

usersRouter.get('/', usersController.listUsers);
usersRouter.get('/me', usersController.getCurrentUser);
usersRouter.get('/:id', userIdRules, validateRequest, usersController.getUser);
usersRouter.post('/', createUserRules, validateRequest, usersController.createUser);
usersRouter.patch('/:id', updateUserRules, validateRequest, usersController.updateUser);
usersRouter.delete('/:id', userIdRules, validateRequest, usersController.deleteUser);
