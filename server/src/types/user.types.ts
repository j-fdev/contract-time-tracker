export type UserRole = 'Admin' | 'Client';

export const USER_ROLES: readonly UserRole[] = ['Admin', 'Client'];

export interface CreateUserInput {
    first_name: string;
    last_name: string;
    email: string;
    password?: string;
    phone_number: string;
    city?: string;
    type?: UserRole;
}

export type UpdateUserInput = Partial<CreateUserInput> & { disabled?: boolean };

/** The authenticated user attached to the request by the auth middleware. */
export interface AuthUser {
    id: string;
    email: string;
    name?: string | null;
}
