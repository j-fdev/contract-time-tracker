import type { ObjectId } from 'mongodb';

import { AppDataSource } from '../db/data-source.js';
import { Project, Punch, Timesheet } from '../entities/index.js';
import type { CreateProjectInput, UpdateProjectInput } from '../types/project.types.js';
import { HttpError } from '../utils/http-error.js';
import { toObjectId } from '../utils/object-id.js';
import { nowInSeconds } from '../utils/time.js';

const projectsRepository = () => AppDataSource.getMongoRepository(Project);

export async function findProjectOrThrow(id: ObjectId): Promise<Project> {
    const project = await projectsRepository().findOne({ where: { _id: id } });
    if (!project) throw HttpError.notFound('Project not found.');
    return project;
}

async function assertProjectNameAvailable(projectName: string, currentProjectId?: ObjectId) {
    const existingProject = await projectsRepository().findOne({ where: { project_name: projectName } });
    const isSameRecord = currentProjectId !== undefined && existingProject?._id.equals(currentProjectId);
    if (existingProject && !isSameRecord) {
        throw HttpError.conflict('A project with this name already exists.', 'project_name');
    }
}

export async function listProjects(): Promise<Project[]> {
    return projectsRepository().find({ order: { timestamp: 'DESC' } });
}

export async function createProject(input: CreateProjectInput): Promise<Project> {
    await assertProjectNameAvailable(input.project_name);

    const project = projectsRepository().create({
        client_id: toObjectId(input.client_id, 'client_id'),
        project_name: input.project_name,
        description: input.description,
        notes: input.notes ?? '',
        hour_rate: input.hour_rate,
        active: input.active ?? true,
        timestamp: nowInSeconds(),
    });

    return projectsRepository().save(project);
}

export async function updateProject(id: ObjectId, input: UpdateProjectInput): Promise<Project> {
    await findProjectOrThrow(id);
    if (input.project_name) {
        await assertProjectNameAvailable(input.project_name, id);
    }

    const { client_id, ...fields } = input;
    const changes: Partial<Project> = { ...fields };
    if (client_id) changes.client_id = toObjectId(client_id, 'client_id');

    await projectsRepository().update({ _id: id }, changes);
    return findProjectOrThrow(id);
}

/** Deletes the project together with its punches and timesheets. */
export async function deleteProject(id: ObjectId): Promise<void> {
    await findProjectOrThrow(id);
    await AppDataSource.getMongoRepository(Punch).deleteMany({ project_id: id });
    await AppDataSource.getMongoRepository(Timesheet).deleteMany({ project_id: id });
    await projectsRepository().deleteOne({ _id: id });
}
