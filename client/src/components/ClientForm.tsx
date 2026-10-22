import { useState } from 'react';
import type { FormEvent } from 'react';
import { Alert, Button, Stack, TextField, Typography } from '@mui/material';

import { ApiError, getErrorMessage } from '../api/client';
import { createClient } from '../api/users';
import type { NewClient, User } from '../types/user';
import MainButton from './MainButton';

const EMPTY_CLIENT: NewClient = { first_name: '', last_name: '', email: '', phone_number: '', city: '' };

const FIELDS: { name: keyof NewClient; label: string; required: boolean; type?: string }[] = [
    { name: 'first_name', label: 'First name', required: true },
    { name: 'last_name', label: 'Last name', required: true },
    { name: 'email', label: 'Email', required: true, type: 'email' },
    { name: 'phone_number', label: 'Phone number', required: true, type: 'tel' },
    { name: 'city', label: 'City', required: false },
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
                    required={field.required}
                    value={values[field.name]}
                    onChange={(event) => setValues({ ...values, [field.name]: event.target.value })}
                    error={Boolean(fieldErrors[field.name])}
                    helperText={fieldErrors[field.name]}
                    fullWidth
                />
            ))}
            <Stack direction="row" spacing={1.5} justifyContent="flex-end">
                <Button onClick={onCancel}>Back</Button>
                <MainButton type="submit" isLoading={isSubmitting} loadingText="Creating...">Create client</MainButton>
            </Stack>
        </Stack>
    );
}
