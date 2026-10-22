import { useEffect, useState } from 'react';
import { Button, Dialog, DialogContent, MenuItem, Stack, TextField, Typography } from '@mui/material';

import type { Project } from '../types/project';
import type { User } from '../types/user';
import MainButton from './MainButton';
import ProjectForm from './ProjectForm';

interface ProjectPickerDialogProps {
    open: boolean;
    projects: Project[];
    clients: User[];
    selectedProjectId: string;
    /** When false the dialog can't be dismissed (a project must be chosen first). */
    canClose: boolean;
    onSelect: (projectId: string) => void;
    onClose: () => void;
    onProjectCreated: (project: Project) => void;
    onClientCreated: (client: User) => void;
}

export default function ProjectPickerDialog({
    open,
    projects,
    clients,
    selectedProjectId,
    canClose,
    onSelect,
    onClose,
    onProjectCreated,
    onClientCreated,
}: ProjectPickerDialogProps) {
    const [choice, setChoice] = useState(selectedProjectId);
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        if (open) {
            setChoice(selectedProjectId || projects[0]?._id || '');
            setIsCreating(projects.length === 0);
        }
    }, [open, selectedProjectId, projects]);

    const handleCreated = (project: Project) => {
        onProjectCreated(project);
        onSelect(project._id);
    };

    return (
        <Dialog open={open} onClose={canClose ? onClose : undefined} fullWidth maxWidth="xs">
            <DialogContent>
                {isCreating ? (
                    <ProjectForm
                        clients={clients}
                        onClientCreated={onClientCreated}
                        onCreated={handleCreated}
                        onCancel={() => setIsCreating(false)}
                    />
                ) : (
                    <Stack spacing={2}>
                        <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 700 }}>Choose a project</Typography>
                        <TextField select label="Project" value={choice} onChange={(event) => setChoice(event.target.value)} fullWidth>
                            {projects.map((project) => (
                                <MenuItem key={project._id} value={project._id}>{project.project_name}</MenuItem>
                            ))}
                        </TextField>
                        <Stack direction="row" spacing={1.5} justifyContent="flex-end">
                            <Button onClick={() => setIsCreating(true)}>New project</Button>
                            <MainButton disabled={!choice} onClick={() => onSelect(choice)}>Continue</MainButton>
                        </Stack>
                    </Stack>
                )}
            </DialogContent>
        </Dialog>
    );
}
