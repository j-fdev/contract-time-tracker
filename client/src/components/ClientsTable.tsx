import { useState } from 'react';
import { Dialog, DialogContent, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';

import { useDashboard } from '../pages/dashboardContext';
import type { User } from '../types/user';
import { formatDate } from '../utils/time';
import ClientForm from './ClientForm';
import MainButton from './MainButton';

const cellSx = { color: 'white', borderColor: '#3a3a3a' };
const headCellSx = { ...cellSx, fontWeight: 700 };

export default function ClientsTable() {
    const { users, reloadUsers, notify } = useDashboard();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const clients = users.filter((user) => user.type === 'Client');

    const handleCreated = async (client: User) => {
        setIsFormOpen(false);
        await reloadUsers();
        notify({ severity: 'success', message: `${client.first_name} ${client.last_name} was added.` });
    };

    return (
        <Paper sx={{ width: '100%', bgcolor: 'black', p: { xs: 1, md: 2 } }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h5" sx={{ fontWeight: 800, color: 'white' }}>Clients</Typography>
                <MainButton size="medium" sx={{ py: 0.75 }} onClick={() => setIsFormOpen(true)}>Add client</MainButton>
            </Stack>

            {clients.length === 0 ? (
                <Typography sx={{ color: 'white', textAlign: 'center', py: 6 }}>No clients yet.</Typography>
            ) : (
                <TableContainer>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell sx={headCellSx}>Name</TableCell>
                                <TableCell sx={headCellSx}>Email</TableCell>
                                <TableCell sx={headCellSx}>Phone</TableCell>
                                <TableCell sx={headCellSx}>City</TableCell>
                                <TableCell sx={headCellSx}>Added</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {clients.map((client) => (
                                <TableRow key={client._id} sx={{ opacity: client.disabled ? 0.5 : 1 }}>
                                    <TableCell sx={cellSx}>{`${client.first_name} ${client.last_name}`}</TableCell>
                                    <TableCell sx={cellSx}>{client.email}</TableCell>
                                    <TableCell sx={cellSx}>{client.phone_number}</TableCell>
                                    <TableCell sx={cellSx}>{client.city}</TableCell>
                                    <TableCell sx={cellSx}>{formatDate(client.timestamp)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            <Dialog open={isFormOpen} onClose={() => setIsFormOpen(false)} fullWidth maxWidth="xs">
                <DialogContent>
                    <ClientForm onCreated={handleCreated} onCancel={() => setIsFormOpen(false)} />
                </DialogContent>
            </Dialog>
        </Paper>
    );
}
