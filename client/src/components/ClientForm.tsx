import { useState } from 'react';
import type { FormEvent } from 'react';
import { Alert, Button, MenuItem, Stack, TextField, Typography } from '@mui/material';

import { ApiError, getErrorMessage } from '../api/client';
import { createClient } from '../api/users';
import { CANADIAN_PROVINCES, type NewClient, type User } from '../types/user';
import MainButton from './MainButton';

const EMPTY_CLIENT: NewClient = {
    first_name: '',
    last_name: '',
    company_name: '',
    email: '',
    phone_number: '',
    address: '',
    city: '',
    province: '',
    postal_code: '',
};

const FIELDS: { name: keyof NewClient; label: string; required: boolean; type?: string; options?: readonly string[] }[] = [
    { name: 'first_name', label: 'First name', required: true },
    { name: 'last_name', label: 'Last name', required: true },
    { name: 'company_name', label: 'Company name', required: false },
    { name: 'email', label: 'Email', required: true, type: 'email' },
    { name: 'phone_number', label: 'Phone number', required: true, type: 'tel' },
    { name: 'address', label: 'Address (street, unit)', required: false },
    { name: 'city', label: 'City', required: false },
    { name: 'province', label: 'Province', required: false, options: CANADIAN_PROVINCES },
    { name: 'postal_code', label: 'Postal code', required: false },
];

interface ClientFormProps {
    onCreated: (client: User) => void;
    onCancel: () => void;
}

export default function ClientForm({ onCreated, onCancel }: ClientFormProps) {
    const [values, setValues] = useState<NewClient>(EMPTY_CLIENT);
    const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof NewClient, string>>>({});
    const [formError, setFormError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setIsSubmitting(true);
        setFieldErrors({});
        setFormError(null);

        try {
            onCreated(await createClient(values));
        } catch (error) {
            if (error instanceof ApiError && error.field) {
                setFieldErrors({ [error.field]: error.message });
            } else {
                setFormError(getErrorMessage(error, 'Unable to create the client.'));
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Stack component="form" spacing={1.5} onSubmit={handleSubmit} noValidate>
            <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 700 }}>New client</Typography>
            {formError && <Alert severity="error">{formError}</Alert>}
            {FIELDS.map((field) => (
                <TextField
                    key={field.name}
                    label={field.label}
                    type={field.type ?? 'text'}
                    select={Boolean(field.options)}
                    required={field.required}
                    value={values[field.name]}
                    onChange={(event) => setValues({ ...values, [field.name]: event.target.value })}
                    error={Boolean(fieldErrors[field.name])}
                    helperText={fieldErrors[field.name]}
                    fullWidth
                >
                    {field.options && <MenuItem value="">-</MenuItem>}
                    {field.options?.map((option) => (
                        <MenuItem key={option} value={option}>{option}</MenuItem>
                    ))}
                </TextField>
            ))}
            <Stack direction="row" spacing={1.5} justifyContent="flex-end">
                <Button onClick={onCancel}>Back</Button>
                <MainButton type="submit" isLoading={isSubmitting} loadingText="Creating...">Create client</MainButton>
            </Stack>
        </Stack>
    );
}
