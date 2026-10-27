import { useState } from 'react';
import type { FormEvent } from 'react';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import { Alert, Box, IconButton, InputAdornment, Paper, Stack, TextField, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

import { getErrorMessage } from '../api/client';
import MainButton from '../components/MainButton';
import { useAuth } from '../context/AuthContext';
import { BRAND_COLORS } from '../theme';

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;

const heroGradient =
    'linear-gradient(180deg, #000000 0%, #000000 58%, rgba(3, 8, 36, 0.98) 76%, rgba(10, 18, 82, 0.9) 90%, rgba(28, 45, 150, 0.78) 100%)';

export default function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [wasSubmitted, setWasSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const emailError = !wasSubmitted ? '' : !email.trim() ? 'Email is required.' : !EMAIL_PATTERN.test(email.trim()) ? 'Enter a valid email address.' : '';
    const passwordError = wasSubmitted && !password ? 'Password is required.' : '';

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setWasSubmitted(true);
        setError(null);
        if (!email.trim() || !EMAIL_PATTERN.test(email.trim()) || !password) return;

        setIsSubmitting(true);
        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (loginError) {
            setError(getErrorMessage(loginError, 'Unable to log in.'));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Box sx={{ minHeight: '100dvh', display: 'grid', alignItems: 'center', px: { xs: 2, md: 3 }, py: 2, bgcolor: '#000000' }}>
            <Paper
                elevation={0}
                sx={{
                    width: 'min(100%, 1060px)',
                    minHeight: { md: 'calc(100dvh - 32px)' },
                    mx: 'auto',
                    p: { xs: 1, md: 1.5 },
                    borderRadius: 5,
                    overflow: 'hidden',
                    bgcolor: 'primary.main',
                    backgroundImage: 'url("/login-background.png")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    boxShadow: `0 28px 80px ${BRAND_COLORS.secondary}bf`,
                    display: 'grid',
                }}
            >
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.5fr 1fr' }, borderRadius: 4, overflow: 'hidden' }}>
                    <Stack spacing={2.5} sx={{ p: { xs: 3, md: 4 }, background: heroGradient, color: '#ffffff', alignItems: 'center', textAlign: 'center' }}>
                        <Box component="img" src="/Contract Time Tracker Punch Emblem.png" alt="Contract Time Tracker" sx={{ width: '100%', maxWidth: { xs: 390, md: 520 } }} />
                        <Typography variant="h3" sx={{ fontWeight: 800, lineHeight: 1.08, fontSize: { xs: '2rem', md: '2.5rem' } }}>
                            Welcome back, <br /> let&apos;s clock in.
                        </Typography>
                        <Typography sx={{ opacity: 0.82, maxWidth: 520, lineHeight: 1.7 }}>
                            Manage project schedules, costs and punch times in one place. Sign in to continue.
                        </Typography>
                    </Stack>

                    <Stack component="form" spacing={2.5} onSubmit={handleSubmit} noValidate sx={{ p: { xs: 3, md: 5 }, bgcolor: '#dbd5d5', justifyContent: 'center' }}>
                        <Box>
                            <Typography variant="h5" sx={{ fontWeight: 800, color: '#1b2746' }}>Sign in</Typography>
                            <Typography sx={{ color: '#5b6785', mt: 0.5 }}>Use your admin account to access the dashboard.</Typography>
                        </Box>
                        {error && <Alert severity="error">{error}</Alert>}
                        <TextField
                            label="Email"
                            type="email"
                            placeholder="name@company.com"
                            autoComplete="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            error={Boolean(emailError)}
                            helperText={emailError || ' '}
                            fullWidth
                        />
                        <TextField
                            label="Password"
                            type={showPassword ? 'text' : 'password'}
                            autoComplete="current-password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            error={Boolean(passwordError)}
                            helperText={passwordError || ' '}
                            fullWidth
                            slotProps={{
                                input: {
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton edge="end" aria-label="Toggle password visibility" onClick={() => setShowPassword((visible) => !visible)}>
                                                {showPassword ? <VisibilityOffRoundedIcon /> : <VisibilityRoundedIcon />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                },
                            }}
                        />
                        <MainButton type="submit" fullWidth isLoading={isSubmitting} loadingText="Signing in...">
                            Continue to dashboard
                        </MainButton>
                    </Stack>
                </Box>
            </Paper>
        </Box>
    );
}
