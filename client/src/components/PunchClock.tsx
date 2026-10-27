import { useMemo, useState } from 'react';
import { keyframes } from '@emotion/react';
import { Box, Stack, Typography } from '@mui/material';

import { getErrorMessage } from '../api/client';
import { clock } from '../api/punches';
import { useNow } from '../hooks/useNow';
import { useDashboard } from '../pages/dashboardContext';
import type { PunchType } from '../types/punch';
import { filterByProject, findActivePunch } from '../utils/punches';
import { formatDuration, formatTime } from '../utils/time';
import MainButton from './MainButton';

const NEON = '47, 123, 255'; // electric blue from the emblem, as "r, g, b"
const RING = '15, 51, 117'; // navbar blue (theme primary #0f3375)

const pulse = keyframes`
    0%, 100% { box-shadow: 0 0 0 0 rgba(46, 204, 113, 0.6); }
    50% { box-shadow: 0 0 0 6px rgba(46, 204, 113, 0); }
`;

const cardSx = {
    width: '100%',
    maxWidth: 640,
    m: '6px', // room for the border drawn outside the card
    px: { xs: 2.5, sm: 5 },
    py: { xs: 3, sm: 4 },
    borderRadius: '28px',
    textAlign: 'center',
    alignItems: 'center',
    color: '#e6e5e5',
    background: 'radial-gradient(ellipse at 50% 35%, #000000 45%, #050b24 80%, #0a1748 100%)',
    // Border drawn as rings around the card, from the inside out: black rim -> blue ring -> blue glow -> drop shadow.
    // The inset shadows make the dark face look recessed inside the border.
    boxShadow: [
        '0 0 0 3px #03050b',
        `0 0 0 6px rgba(${RING}, 0.95)`,
        `0 0 26px 8px rgba(${RING}, 0.35)`,
        '0 30px 60px 8px rgba(0, 0, 0, 0.45)',
        'inset 0 10px 22px rgba(0, 0, 0, 0.9)',
        'inset 0 0 0 1px rgba(255, 255, 255, 0.06)',
    ].join(', '),
} as const;

const BUTTON_DEPTH = 3; // px of "thickness" under the buttons

/** A physical-looking key: a darker edge underneath, and it sinks onto it when pressed. */
function keyButtonSx(face: string, edge: string, glow: string) {
    const raised = `0 ${BUTTON_DEPTH}px 0 ${edge}, 0 ${BUTTON_DEPTH + 4}px 14px rgba(0, 0, 0, 0.55), 0 0 16px ${glow}, inset 0 1px 0 rgba(255, 255, 255, 0.3)`;
    const pressed = `0 1px 0 ${edge}, 0 2px 6px rgba(0, 0, 0, 0.5), 0 0 10px ${glow}, inset 0 3px 8px rgba(0, 0, 0, 0.45)`;
    return {
        minWidth: 180,
        mb: `${BUTTON_DEPTH}px`,
        borderRadius: 999,
        letterSpacing: 1,
        background: face,
        boxShadow: raised,
        transition: 'transform 0.08s ease, box-shadow 0.08s ease, filter 0.15s ease',
        '&:hover:not(.Mui-disabled)': { background: face, boxShadow: raised, filter: 'brightness(1.12)' },
        '&:active:not(.Mui-disabled)': { transform: `translateY(${BUTTON_DEPTH - 1}px)`, boxShadow: pressed },
    };
}

const punchButtonSx = keyButtonSx('linear-gradient(180deg, #3a86ff 0%, #1d55e0 55%, #163fa8 100%)', '#0b2468', `rgba(${NEON}, 0.5)`);
const breakButtonSx = keyButtonSx('linear-gradient(180deg, #3a4150 0%, #252a35 55%, #1a1e27 100%)', '#0b0d12', `rgba(${NEON}, 0.25)`);

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

    const statusColor = isWorking ? '#2ecc71' : isOnBreak ? '#f5b041' : '#8a8f98';

    return (
        <Stack spacing={2.5} sx={cardSx}>
            <Box component="img" src="/Contract Time Tracker Punch Emblem.png" alt="Contract Time Tracker" sx={{ width: '100%', maxWidth: { xs: 300, lg: 420 }, mixBlendMode: 'lighten' }} />
            <Typography
                variant="h2"
                sx={{
                    fontWeight: 700,
                    fontSize: { xs: '3rem', sm: '4rem' },
                    color: '#f4f8ff',
                    fontVariantNumeric: 'tabular-nums',
                    letterSpacing: 2,
                    textShadow: `0 0 8px rgba(${NEON}, 0.9), 0 0 24px rgba(${NEON}, 0.5)`,
                }}
            >
                {formatDuration(activePunch ? now - activePunch.punch_in : 0)}
            </Typography>
            <Box
                sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 1,
                    px: 2,
                    py: 0.75,
                    borderRadius: 999,
                    bgcolor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
            >
                <Box
                    sx={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        bgcolor: statusColor,
                        boxShadow: `0 0 8px ${statusColor}`,
                        animation: isWorking ? `${pulse} 2s ease-in-out infinite` : 'none',
                        '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
                    }}
                />
                <Typography sx={{ color: '#d0d4dc', fontSize: '0.95rem' }}>{status}</Typography>
            </Box>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} sx={{ pt: 1 }}>
                <MainButton
                    disableElevation sx={punchButtonSx}
                    disabled={!selectedProject || isOnBreak || pendingAction !== null}
                    isLoading={pendingAction === 'in'}
                    loadingText="..."
                    onClick={() => handleClock('in')}
                >
                    {isWorking ? 'PUNCH OUT' : 'PUNCH IN'}
                </MainButton>
                <MainButton
                    disableElevation sx={breakButtonSx}
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
