import { useState } from 'react';
import { Alert, Box } from '@mui/material';
import { Outlet, useNavigate } from 'react-router-dom';

import { listProjects } from '../api/projects';
import { listPunches } from '../api/punches';
import { listUsers } from '../api/users';
import DashboardSummary from '../components/DashboardSummary';
import Navbar from '../components/Navbar';
import Notification, { type NotificationMessage } from '../components/Notification';
import ProjectFolderDialog from '../components/ProjectFolderDialog';
import ProjectPickerDialog from '../components/ProjectPickerDialog';
import { useAuth } from '../context/AuthContext';
import { useApiResource } from '../hooks/useApiResource';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useSocketEvent } from '../hooks/useSocketEvent';
import type { Project } from '../types/project';
import type { Punch } from '../types/punch';
import type { User } from '../types/user';
import type { DashboardContext } from './dashboardContext';

const loadAllPunches = () => listPunches();

export default function DashboardPage() {
    const { user: admin, logout } = useAuth();
    const navigate = useNavigate();

    const projects = useApiResource<Project[]>(listProjects, []);
    const users = useApiResource<User[]>(listUsers, []);
    const punches = useApiResource<Punch[]>(loadAllPunches, []);

    const [selectedProjectId, setSelectedProjectId] = useLocalStorage('selectedProjectId', '');
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const [isFolderOpen, setIsFolderOpen] = useState(false);
    const [notification, setNotification] = useState<NotificationMessage | null>(null);

    // Another tab (or device) punched: refresh so every screen shows the same timer.
    useSocketEvent('punches:changed', () => void punches.reload());

    const selectedProject = projects.data.find((project) => project._id === selectedProjectId) ?? null;
    const selectedClient = users.data.find((user) => user._id === selectedProject?.client_id);
    const mustPickProject = !projects.isLoading && !selectedProject;
    const loadError = projects.error ?? users.error ?? punches.error;

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const context: DashboardContext = {
        projects: projects.data,
        users: users.data,
        punches: punches.data,
        selectedProject,
        reloadPunches: punches.reload,
        reloadProjects: projects.reload,
        reloadUsers: users.reload,
        notify: setNotification,
    };

    if (!admin) return null;

    return (
        <>
            <Navbar projectName={selectedProject?.project_name ?? null} onChangeProject={() => setIsPickerOpen(true)} onOpenFolder={() => setIsFolderOpen(true)} />
            <Box
                sx={{
                    px: { xs: 2, md: 3 },
                    py: 2,
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', lg: '350px 1fr' },
                    gap: 2,
                    alignItems: 'start',
                }}
            >
                <DashboardSummary
                    admin={admin}
                    project={selectedProject}
                    client={selectedClient}
                    punches={punches.data}
                    onChangeProject={() => setIsPickerOpen(true)}
                    onLogout={handleLogout}
                />
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, p: { xs: 0, md: 3 } }}>
                    {loadError && <Alert severity="error" sx={{ width: '100%' }}>{loadError}</Alert>}
                    <Outlet context={context} />
                </Box>
            </Box>

            <ProjectPickerDialog
                open={isPickerOpen || mustPickProject}
                canClose={!mustPickProject}
                projects={projects.data}
                clients={users.data.filter((user) => user.type === 'Client')}
                selectedProjectId={selectedProjectId}
                onSelect={(projectId) => {
                    setSelectedProjectId(projectId);
                    setIsPickerOpen(false);
                }}
                onClose={() => setIsPickerOpen(false)}
                onProjectCreated={() => void projects.reload()}
                onClientCreated={() => void users.reload()}
            />
            {selectedProject && (
                <ProjectFolderDialog
                    open={isFolderOpen}
                    project={selectedProject}
                    onClose={() => setIsFolderOpen(false)}
                    onSaved={projects.reload}
                    notify={setNotification}
                />
            )}
            <Notification notification={notification} onClose={() => setNotification(null)} />
        </>
    );
}
