import { useState } from 'react';
import type { FormEvent } from 'react';
import { Alert, Button, InputAdornment, MenuItem, Stack, TextField, Typography } from '@mui/material';

import { ApiError, getErrorMessage } from '../api/client';
import { createProject } from '../api/projects';
import type { Project } from '../types/project';
import type { User } from '../types/user';
import ClientForm from './ClientForm';
import MainButton from './MainButton';

interface ProjectFormValues {
    project_name: string;
    description: string;
    notes: string;
    hour_rate: string;
    client_id: string;
    folder_path: string;
}

const EMPTY_VALUES: ProjectFormValues = { project_name: '', description: '', notes: '', hour_rate: '', client_id: '', folder_path: '' };

interface ProjectFormProps {
    clients: User[];
    onClientCreated: (client: User) => void;
    onCreated: (project: Project) => void;
    onCancel: () => void;
}

export default function ProjectForm({ clients, onClientCreated, onCreated, onCancel }: ProjectFormProps) {
    const [values, setValues] = useState<ProjectFormValues>(EMPTY_VALUES);
    const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof ProjectFormValues, string>>>({});
    const [formError, setFormError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isCreatingClient, setIsCreatingClient] = useState(false);

    const setField = (name: keyof ProjectFormValues, value: string) => setValues((current) => ({ ...current, [name]: value }));

    const handleClientCreated = (client: User) => {
        onClientCreated(client);
        setField('client_id', client._id);
        setIsCreatingClient(false);
    };

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setIsSubmitting(true);
        setFieldErrors({});
        setFormError(null);

        try {
            const project = await createProject({ ...values, hour_rate: Number(values.hour_rate) });
            onCreated(project);
        } catch (error) {
            if (error instanceof ApiError && error.field) {
                setFieldErrors({ [error.field]: error.message });
            } else {
                setFormError(getErrorMessage(error, 'Unable to create the project.'));
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isCreatingClient) {
        return <ClientForm onCreated={handleClientCreated} onCancel={() => setIsCreatingClient(false)} />;
    }

    const textField = (name: keyof ProjectFormValues, label: string, required = true) => (
        <TextField
            label={label}
            required={required}
            value={values[name]}
            onChange={(event) => setField(name, event.target.value)}
            error={Boolean(fieldErrors[name])}
            helperText={fieldErrors[name]}
            fullWidth
        />
    );

    return (
        <Stack component="form" spacing={1.5} onSubmit={handleSubmit} noValidate>
            <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 700 }}>New project</Typography>
            {formError && <Alert severity="error">{formError}</Alert>}
            {textField('project_name', 'Project name')}
            {textField('description', 'Description')}
            {textField('notes', 'Notes', false)}
            {textField('folder_path', 'Project folder on your computer (optional)', false)}
            <TextField
                label="Hourly rate"
                type="number"
                required
                value={values.hour_rate}
                onChange={(event) => setField('hour_rate', event.target.value)}
                error={Boolean(fieldErrors.hour_rate)}
                helperText={fieldErrors.hour_rate}
                slotProps={{
                    input: { startAdornment: <InputAdornment position="start">$</InputAdornment> },
                    htmlInput: { min: 0, step: '0.01' },
                }}
                fullWidth
            />
            <Stack direction="row" spacing={1} alignItems="flex-start">
                <TextField
                    select
                    label="Client"
                    required
                    value={values.client_id}
                    onChange={(event) => setField('client_id', event.target.value)}
                    error={Boolean(fieldErrors.client_id)}
                    helperText={fieldErrors.client_id ?? (clients.length === 0 ? 'No clients yet: create one.' : undefined)}
                    fullWidth
                >
                    {clients.map((client) => (
                        <MenuItem key={client._id} value={client._id}>
                            {`${client.first_name} ${client.last_name}`}
                        </MenuItem>
                    ))}
                </TextField>
                <Button onClick={() => setIsCreatingClient(true)} sx={{ whiteSpace: 'nowrap', mt: 1 }}>
                    New client
                </Button>
            </Stack>
            <Stack direction="row" spacing={1.5} justifyContent="flex-end">
                <Button onClick={onCancel}>Back</Button>
                <MainButton type="submit" isLoading={isSubmitting} loadingText="Creating...">Create project</MainButton>
            </Stack>
        </Stack>
    );
}
