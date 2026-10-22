export type UserRole = 'Admin' | 'Client';

export interface User {
    _id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    city: string;
    type: UserRole;
    disabled: boolean;
    timestamp: number;
}

export interface NewClient {
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    city: string;
}
