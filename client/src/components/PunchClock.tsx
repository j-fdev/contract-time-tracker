import { useMemo, useState } from 'react';
import { Box, Stack, Typography } from '@mui/material';

import { getErrorMessage } from '../api/client';
import { clock } from '../api/punches';
import { useNow } from '../hooks/useNow';
import { useDashboard } from '../pages/dashboardContext';
import type { PunchType } from '../types/punch';
import { filterByProject, findActivePunch } from '../utils/punches';
import { formatDuration, formatTime } from '../utils/time';
import MainButton from './MainButton';

const buttonShadow = { boxShadow: '6px 6px 20px -5px rgba(129, 125, 125, 0.9)', minWidth: 160 };

export default function PunchClock() {
    const { selectedProject, punches, reloadPunches, notify } = useDashboard();
    const [pendingAction, setPendingAction] = useState<PunchType | null>(null);

    const projectPunches = useMemo(() => filterByProject(punches, selectedProject?._id), [punches, selectedProject]);
    const activePunch = findActivePunch(projectPunches);
    const isWorking = activePunch?.type === 'in';
    const isOnBreak = activePunch?.type === 'break';
    const now = useNow(Boolean(activePunch));

    const handleClock = async (type: PunchType) => {
        if (!selectedProject) return;
        setPendingAction(type);
        try {
            const { message } = await clock(selectedProject._id, type);
            await reloadPunches();
            notify({ severity: 'success', message });
        } catch (error) {
            notify({ severity: 'error', message: getErrorMessage(error) });
        } finally {
            setPendingAction(null);
        }
    };

    const status = isWorking
        ? `Working since ${formatTime(activePunch.punch_in)}`
        : isOnBreak
          ? `On break since ${formatTime(activePunch.punch_in)}`
          : 'Not clocked in';

    return (
        <Stack spacing={2} sx={{ width: '100%', maxWidth: 640, alignItems: 'center', textAlign: 'center', bgcolor: 'black', py: 3 }}>
            <Box component="img" src="/punch-logo.png" alt="Contract Time Tracker" sx={{ width: '100%', maxWidth: { xs: 320, lg: 460 } }} />
            <Typography variant="h3" sx={{ fontWeight: 800, color: '#e6e5e5', fontVariantNumeric: 'tabular-nums' }}>
                {formatDuration(activePunch ? now - activePunch.punch_in : 0)}
            </Typography>
            <Typography sx={{ color: '#bdbdbd' }}>{status}</Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
                <MainButton
                    sx={buttonShadow}
                    disabled={!selectedProject || isOnBreak || pendingAction !== null}
                    isLoading={pendingAction === 'in'}
                    loadingText="..."
                    onClick={() => handleClock('in')}
                >
                    {isWorking ? 'PUNCH OUT' : 'PUNCH IN'}
                </MainButton>
                <MainButton
                    sx={buttonShadow}
                    disabled={!activePunch || pendingAction !== null}
                    isLoading={pendingAction === 'break'}
                    loadingText="..."
                    onClick={() => handleClock('break')}
                >
                    {isOnBreak ? 'END BREAK' : 'START BREAK'}
                </MainButton>
            </Stack>
        </Stack>
    );
}
