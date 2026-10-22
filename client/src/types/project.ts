export interface Project {
    _id: string;
    client_id: string;
    project_name: string;
    description: string;
    notes: string;
    hour_rate: number;
    active: boolean;
    timestamp: number;
}

export interface NewProject {
    client_id: string;
    project_name: string;
    description: string;
    notes: string;
    hour_rate: number;
}
