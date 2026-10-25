export type UserRole = 'Admin' | 'Client';

export const USER_ROLES: readonly UserRole[] = ['Admin', 'Client'];

export const CANADIAN_PROVINCES = ['AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'NT', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT'] as const;
export type Province = (typeof CANADIAN_PROVINCES)[number];

export interface CreateUserInput {
    first_name: string;
    last_name: string;
    email: string;
    password?: string;
    phone_number: string;
    company_name?: string;
    address?: string;
    city?: string;
    province?: Province | '';
    postal_code?: string;
    type?: UserRole;
}

export type UpdateUserInput = Partial<CreateUserInput> & { disabled?: boolean };

export interface AuthUser {
    id: string;
    email: string;
    name?: string | null;
}
