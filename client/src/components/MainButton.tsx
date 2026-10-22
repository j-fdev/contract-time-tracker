import { Button } from '@mui/material';
import type { ButtonProps } from '@mui/material';

import { BRAND_COLORS } from '../theme';

type MainButtonProps = ButtonProps & {
    isLoading?: boolean;
    loadingText?: string;
};

/** The app's primary call-to-action button (blue gradient). */
export default function MainButton({ isLoading = false, loadingText, children, disabled, sx, ...buttonProps }: MainButtonProps) {
    return (
        <Button
            variant="contained"
            size="large"
            disabled={disabled || isLoading}
            sx={[
                {
                    py: 1.3,
                    borderRadius: 2,
                    fontWeight: 700,
                    textTransform: 'none',
                    fontSize: '1rem',
                    color: '#ffffff',
                    background: BRAND_COLORS.buttonGradient,
                    '&.Mui-disabled': { color: 'rgba(255, 255, 255, 0.7)', opacity: 0.6 },
                },
                ...(Array.isArray(sx) ? sx : [sx]),
            ]}
            {...buttonProps}
        >
            {isLoading && loadingText ? loadingText : children}
        </Button>
    );
}
