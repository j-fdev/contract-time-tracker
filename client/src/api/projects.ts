import type { NewProject, Project } from '../types/project';
import { apiRequest, type ApiResponse } from './client';

export async function listProjects(): Promise<Project[]> {
    return (await apiRequest<ApiResponse<Project[]>>('/projects')).data;
}

export async function updateProject(id: string, changes: Partial<NewProject>): Promise<Project> {
    return (await apiRequest<ApiResponse<Project>>(`/projects/${id}`, { method: 'PATCH', body: changes })).data;
}

export async function createProject(project: NewProject): Promise<Project> {
    return (await apiRequest<ApiResponse<Project>>('/projects', { method: 'POST', body: project })).data;
}
