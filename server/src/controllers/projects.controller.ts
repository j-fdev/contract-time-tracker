import type { Request, Response } from 'express';
import { matchedData } from 'express-validator';

import * as projectsService from '../services/projects.service.js';
import type { CreateProjectInput, UpdateProjectInput } from '../types/project.types.js';
import { toObjectId } from '../utils/object-id.js';

export async function listProjects(_req: Request, res: Response) {
    res.json({ data: await projectsService.listProjects() });
}

export async function createProject(req: Request, res: Response) {
    const input = matchedData<CreateProjectInput>(req, { locations: ['body'] });
    const project = await projectsService.createProject(input);
    res.status(201).json({ data: project, message: 'Project created.' });
}

export async function updateProject(req: Request, res: Response) {
    const input = matchedData<UpdateProjectInput>(req, { locations: ['body'] });
    const project = await projectsService.updateProject(toObjectId(String(req.params.id)), input);
    res.json({ data: project, message: 'Project updated.' });
}

export async function deleteProject(req: Request, res: Response) {
    await projectsService.deleteProject(toObjectId(String(req.params.id)));
    res.json({ message: 'Project deleted.' });
}
