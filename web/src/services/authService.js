const API_URL = "http://localhost:8080/api/auth";

export const login = async (username, password) => {
    const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
        throw new Error('Pogrešno korisničko ime ili lozinka.');
    }

    return response.json();
};

export const refreshToken = async () => {
    const storedRefreshToken = localStorage.getItem('refreshToken');

    const response = await fetch(`${API_URL}/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: storedRefreshToken }),
    });

    if (!response.ok) {
        throw new Error('Sesija je istekla, molimo prijavite se ponovo.');
    }

    const data = await response.json();
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    return data;
};

export const logout = async () => {
    const storedRefreshToken = localStorage.getItem('refreshToken');

    try {
        await fetch(`${API_URL}/logout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken: storedRefreshToken }),
        });
    } finally {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
    }
};