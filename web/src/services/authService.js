const API_URL = "http://localhost:8080/api/auth";

export const login = async (username, password) => {
    const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        credentials: 'include', // receives HttpOnly refresh token cookie
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
        throw new Error('Pogrešno korisničko ime ili lozinka.');
    }

    return response.json(); // { accessToken, refreshToken } — accessToken stored in memory
};

// Called on app load and by apiClient on 401 — uses HttpOnly cookie automatically
export const refreshToken = async () => {
    const response = await fetch(`${API_URL}/refresh`, {
        method: 'POST',
        credentials: 'include', // sends HttpOnly cookie, receives new one
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}), // empty body — Spring requires valid JSON even when @RequestBody is optional
    });

    if (!response.ok) {
        throw new Error('Sesija je istekla, molimo prijavite se ponovo.');
    }

    return response.json();
};

export const logout = async () => {
    try {
        await fetch(`${API_URL}/logout`, {
            method: 'POST',
            credentials: 'include', // sends cookie so backend can revoke it
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({}),
        });
    } catch {
        // Ignore network errors — local logout proceeds regardless
    }
};
