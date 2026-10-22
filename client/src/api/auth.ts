// Auth.js endpoints (mounted by the backend at /api/auth).

async function getCsrfToken(): Promise<string> {
    const response = await fetch('/api/auth/csrf', { credentials: 'include' });
    const { csrfToken } = await response.json();
    if (typeof csrfToken !== 'string') throw new Error('Could not reach the authentication server.');
    return csrfToken;
}

async function postAuthForm(path: string, fields: Record<string, string>): Promise<string> {
    const csrfToken = await getCsrfToken();
    const response = await fetch(`/api/auth/${path}`, {
        method: 'POST',
        credentials: 'include',
        // Makes Auth.js answer with JSON ({ url }) instead of redirecting.
        headers: { 'X-Auth-Return-Redirect': '1' },
        body: new URLSearchParams({ ...fields, csrfToken }),
    });
    const { url } = await response.json().catch(() => ({ url: '' }));
    return typeof url === 'string' ? url : '';
}

/** Returns true when the credentials were accepted and a session cookie was set. */
export async function signIn(email: string, password: string): Promise<boolean> {
    const redirectUrl = await postAuthForm('callback/credentials', { email, password });
    return !redirectUrl.includes('error=');
}

export async function signOut(): Promise<void> {
    await postAuthForm('signout', {});
}
