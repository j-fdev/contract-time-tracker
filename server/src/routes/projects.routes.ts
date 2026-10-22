import { Router } from 'express';

import * as projectsController from '../controllers/projects.controller.js';
import { validateRequest } from '../middlewares/validate-request.js';
import { createProjectRules, projectIdRules, updateProjectRules } from '../validators/project.validators.js';

export const projectsRouter = Router();

projectsRouter.get('/', projectsController.listProjects);
projectsRouter.post('/', createProjectRules, validateRequest, projectsController.createProject);
projectsRouter.patch('/:id', updateProjectRules, validateRequest, projectsController.updateProject);
projectsRouter.delete('/:id', projectIdRules, validateRequest, projectsController.deleteProject);
