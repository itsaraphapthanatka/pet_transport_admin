const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// process.env.NODE_ENV is inlined by Next, so the debug logs below are dropped
// from the production bundle entirely.
const IS_DEV = process.env.NODE_ENV !== 'production';

// Prevent multiple simultaneous redirects
let isRedirectingToLogin = false;

export type ApiFetchOptions = RequestInit & {
    /**
     * Keep a 401 as a normal response instead of wiping the token and sending
     * the browser to /login. The login form needs this: a wrong password also
     * answers 401, and a redirect there reloads the page and throws the error
     * message away.
     */
    skipAuthRedirect?: boolean;
};

export async function apiFetch(endpoint: string, options: ApiFetchOptions = {}) {
    const { skipAuthRedirect = false, ...init } = options;
    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    };

    if (init.headers) {
        Object.assign(headers, init.headers);
    }

    if (headers['Content-Type'] === 'none') {
        delete headers['Content-Type'];
    }

    const method = init.method || 'GET';
    const fullUrl = `${API_URL}${endpoint}`;
    // Never log `headers` - it carries `Authorization: Bearer <JWT>`, and the
    // browser console keeps it around for anyone looking over the shoulder.
    if (IS_DEV) {
        console.log(`[apiFetch] ${method} ${fullUrl}`, { hasToken: !!token });
    }

    try {
        const response = await window.fetch(fullUrl, {
            ...init,
            headers,
        });

        if (response.status === 401 && !skipAuthRedirect) {
            if (typeof window !== 'undefined' && !isRedirectingToLogin) {
                isRedirectingToLogin = true;
                localStorage.removeItem('admin_token');
                localStorage.removeItem('admin_user');
                window.location.href = '/login';
            }
        }

        return response;
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        console.error(`[apiFetch] Network error on ${method} ${fullUrl}: ${message}`);
        throw err;
    }
}
