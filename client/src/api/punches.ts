import type { ClockAction, Punch, PunchType } from '../types/punch';
import { apiRequest, type ApiResponse } from './client';

export interface ClockResponse extends ApiResponse<Punch | null> {
    action: ClockAction;
    message: string;
}

/** All punches, or only those of one project. */
export async function listPunches(projectId?: string): Promise<Punch[]> {
    const query = projectId ? `?projectId=${encodeURIComponent(projectId)}` : '';
    return (await apiRequest<ApiResponse<Punch[]>>(`/punches${query}`)).data;
}

/** Punch in/out ("in") or start/end a break ("break") on a project. */
export function clock(projectId: string, type: PunchType): Promise<ClockResponse> {
    return apiRequest<ClockResponse>('/punches/clock', { method: 'POST', body: { project_id: projectId, type } });
}
