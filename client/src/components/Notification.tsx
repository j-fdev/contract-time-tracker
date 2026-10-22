import { Alert, Snackbar } from '@mui/material';
import type { AlertColor } from '@mui/material';

export interface NotificationMessage {
    severity: AlertColor;
    message: string;
}

interface NotificationProps {
    notification: NotificationMessage | null;
    onClose: () => void;
}

/** A toast shown at the top of the screen. */
export default function Notification({ notification, onClose }: NotificationProps) {
    return (
        <Snackbar
            open={notification !== null}
            autoHideDuration={5000}
            onClose={onClose}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
            <Alert onClose={onClose} severity={notification?.severity ?? 'info'} variant="filled" sx={{ width: '100%' }}>
                {notification?.message}
            </Alert>
        </Snackbar>
    );
}
