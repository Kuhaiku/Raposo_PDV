function checkAuth(role) {
    const token = localStorage.getItem('authToken');
    if (!token) {
        window.location.href = '/login.html';
        return;
    }
    // Opcional: verifica se o usuário tem a 'role' necessária para a página
    if (role) {
        const payload = getTokenPayload();
        if (!payload || payload.role !== role) {
            alert('Acesso negado.');
            logout();
        }
    }
}
function logout() {
    localStorage.removeItem('authToken');
    window.location.href = '/login.html';
}
function getTokenPayload() {
    const token = localStorage.getItem('authToken');
    if (!token) return null;
    try {
        const payload = token.split('.')[1];
        return JSON.parse(atob(payload));
    } catch (e) {
        logout();
        return null;
    }
}
async function fetchWithAuth(url, options = {}) {
    const token = localStorage.getItem('authToken');
    const headers = { 'Content-Type': 'application/json', ...options.headers };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(url, { ...options, headers });
    if (response.status === 401 || response.status === 403) {
        logout();
    }
    return response;
}