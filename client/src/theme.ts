import { createTheme } from '@mui/material/styles';

export const BRAND_COLORS = {
    primary: '#0f3375',
    secondary: '#5c5ed8',
    buttonGradient: 'linear-gradient(90deg, #1e40af 0%, #1a3aa0 50%, #142f85 100%)',
    panel: '#f4f4f3',
} as const;

export const theme = createTheme({
    palette: {
        primary: { main: BRAND_COLORS.primary },
        secondary: { main: BRAND_COLORS.secondary },
    },
    typography: {
        fontFamily: '"Trebuchet MS", "Segoe UI", sans-serif',
    },
    shape: { borderRadius: 8 },
});
