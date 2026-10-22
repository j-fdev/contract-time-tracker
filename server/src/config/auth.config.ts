import type { ExpressAuthConfig } from '@auth/express';
import Credentials from '@auth/express/providers/credentials';

import { verifyCredentials } from '../services/auth.service.js';
import { env } from './env.js';

export const authConfig: ExpressAuthConfig = {
    secret: env.authSecret,
    basePath: '/api/auth',
    session: { strategy: 'jwt' },
    providers: [
        Credentials({
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                const { email, password } = credentials ?? {};
                if (typeof email !== 'string' || typeof password !== 'string') return null;
                return verifyCredentials(email, password);
            },
        }),
    ],
    callbacks: {
        jwt({ token, user }) {
            if (user?.id) token.id = user.id;
            return token;
        },
        session({ session, token }) {
            if (session.user && typeof token.id === 'string') session.user.id = token.id;
            return session;
        },
    },
};
