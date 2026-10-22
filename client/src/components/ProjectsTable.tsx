import { useMemo } from 'react';
import { Chip, Paper, Table, TableBody, TableCell, TableContainer, TableFooter, TableHead, TableRow, Typography } from '@mui/material';

import { useNow } from '../hooks/useNow';
import { useDashboard } from '../pages/dashboardContext';
import { calculateCost, formatCurrency } from '../utils/money';
import { filterByProject, findActivePunch, sumDurations } from '../utils/punches';
import { formatDate, formatDuration } from '../utils/time';

const cellSx = { color: 'white', borderColor: '#3a3a3a' };
const headCellSx = { ...cellSx, fontWeight: 700 };

export default function ProjectsTable() {
    const { projects, users, punches } = useDashboard();
    const now = useNow(punches.some((punch) => punch.punch_out === 0));

    const clientNames = useMemo(
        () => new Map(users.map((user) => [user._id, `${user.first_name} ${user.last_name}`])),
        [users],
    );

    const rows = projects.map((project) => {
        const projectPunches = filterByProject(punches, project._id);
        const workedSeconds = sumDurations(projectPunches, 'in', now);
        return {
            project,
            clientName: clientNames.get(project.client_id) ?? 'No client assigned',
            isRunning: Boolean(findActivePunch(projectPunches)),
            workedSeconds,
            cost: calculateCost(workedSeconds, project.hour_rate),
        };
    });

    const totalSeconds = rows.reduce((sum, row) => sum + row.workedSeconds, 0);
    const totalCost = rows.reduce((sum, row) => sum + row.cost, 0);

    return (
        <Paper sx={{ width: '100%', bgcolor: 'black', p: { xs: 1, md: 2 } }}>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 2, color: 'white' }}>Projects</Typography>
            {rows.length === 0 ? (
                <Typography sx={{ color: 'white', textAlign: 'center', py: 6 }}>No projects yet.</Typography>
            ) : (
                <TableContainer>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell sx={headCellSx}>Project</TableCell>
                                <TableCell sx={headCellSx}>Created</TableCell>
                                <TableCell sx={headCellSx}>Client</TableCell>
                                <TableCell sx={headCellSx} align="right">Hourly rate</TableCell>
                                <TableCell sx={headCellSx} align="right">Total (hrs)</TableCell>
                                <TableCell sx={headCellSx} align="right">Accrued cost</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {rows.map(({ project, clientName, isRunning, workedSeconds, cost }) => (
                                <TableRow key={project._id}>
                                    <TableCell sx={cellSx}>
                                        {project.project_name}
                                        {isRunning && <Chip label="Running" color="success" size="small" sx={{ ml: 1 }} />}
                                    </TableCell>
                                    <TableCell sx={cellSx}>{formatDate(project.timestamp)}</TableCell>
                                    <TableCell sx={cellSx}>{clientName}</TableCell>
                                    <TableCell sx={cellSx} align="right">{formatCurrency(project.hour_rate)}</TableCell>
                                    <TableCell sx={cellSx} align="right">{formatDuration(workedSeconds)}</TableCell>
                                    <TableCell sx={cellSx} align="right">{formatCurrency(cost)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                        <TableFooter>
                            <TableRow>
                                <TableCell sx={headCellSx} colSpan={4}>Total</TableCell>
                                <TableCell sx={headCellSx} align="right">{formatDuration(totalSeconds)}</TableCell>
                                <TableCell sx={headCellSx} align="right">{formatCurrency(totalCost)}</TableCell>
                            </TableRow>
                        </TableFooter>
                    </Table>
                </TableContainer>
            )}
        </Paper>
    );
}
