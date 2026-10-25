import { useMemo } from 'react';
import { Box, Button, Paper, Stack, Typography } from '@mui/material';

import { useNow } from '../hooks/useNow';
import { BRAND_COLORS } from '../theme';
import type { Project } from '../types/project';
import type { Punch } from '../types/punch';
import type { User } from '../types/user';
import { calculateCost, formatCurrency } from '../utils/money';
import { filterByProject, findActivePunch, getSessionStart, sumDurations } from '../utils/punches';
import { formatDuration, formatTime, getTodayRange } from '../utils/time';
import MainButton from './MainButton';

interface DashboardSummaryProps {
    admin: User;
    project: Project | null;
    client: User | undefined;
    punches: Punch[];
    onChangeProject: () => void;
    onLogout: () => void;
}

function SummaryLine({ label, value }: { label: string; value: string }) {
    return (
        <Typography>
            {label}: <strong>{value}</strong>
        </Typography>
    );
}

/** Sidebar with today's hours and the cost of the selected project. */
export default function DashboardSummary({ admin, project, client, punches, onChangeProject, onLogout }: DashboardSummaryProps) {
    const projectPunches = useMemo(() => filterByProject(punches, project?._id), [punches, project]);
    const activePunch = findActivePunch(projectPunches);
    const now = useNow(Boolean(activePunch));
    const today = getTodayRange();

    const projectSeconds = sumDurations(projectPunches, 'in', now);
    const sessionStart = activePunch ? formatTime(getSessionStart(projectPunches, activePunch)) : 'Not currently clocked in';

    return (
        <Paper sx={{ p: { xs: 3, md: 5 }, borderRadius: 4, bgcolor: BRAND_COLORS.panel, boxShadow: '0 28px 80px rgba(27, 39, 70, 0.35)' }}>
            <Stack spacing={2}>
                <Typography variant="overline" sx={{ letterSpacing: 1.4, fontWeight: 800 }}>CONTRACT TIME TRACKER</Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main' }}>Dashboard</Typography>
                <SummaryLine label="Signed in as" value={`${admin.first_name} ${admin.last_name}`} />
                <Box>
                    <SummaryLine label="Project" value={project?.project_name ?? 'No project selected'} />
                    <Button variant="outlined" size="small" onClick={onChangeProject} sx={{ mt: 1, textTransform: 'none' }}>
                        Change or create project
                    </Button>
                </Box>
                <SummaryLine label="Session started" value={sessionStart} />
                <SummaryLine label="Worked today" value={formatDuration(sumDurations(projectPunches, 'in', now, today))} />
                <SummaryLine label="Breaks today" value={formatDuration(sumDurations(projectPunches, 'break', now, today))} />
                <SummaryLine label="Project total" value={formatDuration(projectSeconds)} />
                <SummaryLine label="Hourly rate" value={formatCurrency(project?.hour_rate ?? 0)} />
                <SummaryLine label="Accrued cost" value={formatCurrency(calculateCost(projectSeconds, project?.hour_rate ?? 0))} />
                <SummaryLine label="Client" value={client ? `${client.first_name} ${client.last_name}` : 'Not available'} />
                <SummaryLine label="Company name" value={client?.company_name || 'Not available'} />
                <SummaryLine label="Client email" value={client?.email || 'Not available'} />
                <SummaryLine label="Client phone" value={client?.phone_number || 'Not available'} />
                <MainButton onClick={onLogout}>Log out</MainButton>
            </Stack>
        </Paper>
    );
}
