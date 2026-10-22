import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import * as authApi from '../api/auth';
import { getCurrentUser } from '../api/users';
import { socket } from '../lib/socket';
import type { User } from '../types/user';

type AuthStatus = 'loading' | 'authenticated' | 'anonymous';

interface AuthContextValue {
    user: User | null;
    status: AuthStatus;
    /** Throws an Error with a user-friendly message when the login is refused. */
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/** Only admins can use the dashboard. Returns the admin, or null when there is no valid admin session. */
async function fetchSessionAdmin(): Promise<User | null> {
    try {
        const user = await getCurrentUser();
        return user.type === 'Admin' ? user : null;
    } catch {
        return null;
    }
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [status, setStatus] = useState<AuthStatus>('loading');

    // Restore the session after a page reload.
    useEffect(() => {
        void fetchSessionAdmin().then((admin) => {
            setUser(admin);
            setStatus(admin ? 'authenticated' : 'anonymous');
        });
    }, []);

    // The real-time connection only makes sense (and is only accepted) while logged in.
    useEffect(() => {
        if (status === 'authenticated') socket.connect();
        else socket.disconnect();
    }, [status]);

    const login = useCallback(async (email: string, password: string) => {
        const accepted = await authApi.signIn(email.trim(), password);
        const admin = accepted ? await fetchSessionAdmin() : null;

        if (!admin) {
            if (accepted) await authApi.signOut();
            throw new Error('Invalid email or password, or this account is not an admin.');
        }

        setUser(admin);
        setStatus('authenticated');
    }, []);

    const logout = useCallback(async () => {
        await authApi.signOut().catch(() => undefined);
        setUser(null);
        setStatus('anonymous');
    }, []);

    const value = useMemo(() => ({ user, status, login, logout }), [user, status, login, logout]);
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used inside <AuthProvider>.');
    return context;
}
