import type { ReactElement } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { Navigate, Route, Routes } from 'react-router-dom';

import ClientsTable from './components/ClientsTable';
import ProjectsTable from './components/ProjectsTable';
import PunchClock from './components/PunchClock';
import { useAuth } from './context/AuthContext';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';

function RequireAuth({ children }: { children: ReactElement }) {
    const { status } = useAuth();
    return status === 'authenticated' ? children : <Navigate to="/" replace />;
}

export default function App() {
    const { status } = useAuth();

    if (status === 'loading') {
        return (
            <Box sx={{ minHeight: '100dvh', display: 'grid', placeItems: 'center' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Routes>
            <Route path="/" element={status === 'authenticated' ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
            <Route path="/dashboard" element={<RequireAuth><DashboardPage /></RequireAuth>}>
                <Route index element={<Navigate to="punch" replace />} />
                <Route path="punch" element={<PunchClock />} />
                <Route path="projects" element={<ProjectsTable />} />
                <Route path="clients" element={<ClientsTable />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}
