export function getAuthToken(): string | null {
    // Current implementation reads from localStorage; migrate to httpOnly cookie when backend supports it
    try {
        return localStorage.getItem('token');
    } catch (e) {
        return null;
    }
}

export function requireAuthToken(): string {
    const t = getAuthToken();
    if (!t) throw new Error('No auth token');
    return t;
}
