export type UserRole = 'Admin' | 'Client';

export const CANADIAN_PROVINCES = ['AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'NT', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT'] as const;

export interface User {
    _id: string;
    first_name: string;
    last_name: string;
    company_name?: string;
    email: string;
    phone_number: string;
    address?: string;
    city: string;
    province?: string;
    postal_code?: string;
    type: UserRole;
    disabled: boolean;
    timestamp: number;
}

export interface NewClient {
    first_name: string;
    last_name: string;
    company_name: string;
    email: string;
    phone_number: string;
    address: string;
    city: string;
    province: string;
    postal_code: string;
}
