import { useEffect, useState } from 'react';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography } from '@mui/material';

import { getErrorMessage } from '../api/client';
import { updateProject } from '../api/projects';
import type { NotificationMessage } from './Notification';
import type { Project } from '../types/project';
import MainButton from './MainButton';

interface ProjectFolderDialogProps {
    open: boolean;
    project: Project;
    onClose: () => void;
    onSaved: () => Promise<void>;
    notify: (notification: NotificationMessage) => void;
}

/** Shows where the project's files are, and copies the path so it can be pasted in File Explorer. */
export default function ProjectFolderDialog({ open, project, onClose, onSaved, notify }: ProjectFolderDialogProps) {
    const [folderPath, setFolderPath] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (open) {
            setFolderPath(project.folder_path ?? '');
            setError(null);
        }
    }, [open, project]);

    const savedPath = project.folder_path ?? '';
    const hasChanges = folderPath.trim() !== savedPath;

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(savedPath);
            notify({ severity: 'success', message: 'Folder path copied. In File Explorer, press Ctrl+L then Ctrl+V and Enter.' });
            onClose();
        } catch {
            setError('Could not copy automatically. Select the path above and copy it with Ctrl+C.');
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        setError(null);
        try {
            await updateProject(project._id, { folder_path: folderPath.trim() });
            await onSaved();
            notify({ severity: 'success', message: 'Project folder saved.' });
        } catch (saveError) {
            setError(getErrorMessage(saveError, 'Unable to save the folder.'));
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle sx={{ color: 'primary.main', fontWeight: 700 }}>Project folder</DialogTitle>
            <DialogContent>
                <Typography sx={{ mb: 2 }}>
                    Where the files for <strong>{project.project_name}</strong> are on your computer.
                </Typography>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                <TextField
                    label="Folder path"
                    placeholder="C:\Clients\Acme\Website"
                    value={folderPath}
                    onChange={(event) => setFolderPath(event.target.value)}
                    helperText="Tip: in File Explorer, click the address bar of the folder and copy it."
                    fullWidth
                />
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={onClose}>Close</Button>
                {hasChanges ? (
                    <MainButton size="medium" sx={{ py: 0.75 }} isLoading={isSaving} loadingText="Saving..." onClick={handleSave}>
                        Save
                    </MainButton>
                ) : (
                    <MainButton size="medium" sx={{ py: 0.75 }} disabled={!savedPath} startIcon={<ContentCopyIcon />} onClick={handleCopy}>
                        Copy path
                    </MainButton>
                )}
            </DialogActions>
        </Dialog>
    );
}
