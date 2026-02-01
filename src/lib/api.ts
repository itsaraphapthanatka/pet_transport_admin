const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Prevent multiple simultaneous redirects
let isRedirectingToLogin = false;

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    };

    if (options.headers) {
        Object.assign(headers, options.headers);
    }

    if (headers['Content-Type'] === 'none') {
        delete headers['Content-Type'];
    }

    const fullUrl = `${API_URL}${endpoint}`;
    console.log(`[apiFetch] Requesting: ${fullUrl}`, {
        method: options.method || 'GET',
        hasToken: !!token,
        headers
    });

    try {
        const response = await window.fetch(fullUrl, {
            ...options,
            headers,
        });

        if (response.status === 401) {
            if (typeof window !== 'undefined' && !isRedirectingToLogin) {
                isRedirectingToLogin = true;
                localStorage.removeItem('admin_token');
                localStorage.removeItem('admin_user');
                window.location.href = '/login';
            }
        }

        return response;
    } catch (err: any) {
        console.error(`[apiFetch] CRITICAL FETCH ERROR for ${fullUrl}:`, {
            message: err.message,
            stack: err.stack,
            cause: err.cause
        });
        throw err;
    }
}
