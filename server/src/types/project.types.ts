export interface CreateProjectInput {
    client_id: string;
    project_name: string;
    description: string;
    notes?: string;
    hour_rate: number;
    folder_path?: string;
    active?: boolean;
}

export type UpdateProjectInput = Partial<CreateProjectInput>;
