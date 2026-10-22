import type { NewClient, User } from '../types/user';
import { apiRequest, type ApiResponse } from './client';

export async function getCurrentUser(): Promise<User> {
    return (await apiRequest<ApiResponse<User>>('/users/me')).data;
}

export async function listUsers(): Promise<User[]> {
    return (await apiRequest<ApiResponse<User[]>>('/users')).data;
}

export async function createClient(client: NewClient): Promise<User> {
    const body = { ...client, type: 'Client' };
    return (await apiRequest<ApiResponse<User>>('/users', { method: 'POST', body })).data;
}
