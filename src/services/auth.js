import { api, TOKEN_KEY } from '@/services/api';

export async function signIn(email, password) {
    const { data } = await api.post('/login', { email: email.trim(), password });
    localStorage.setItem(TOKEN_KEY, data.token);
}

export const signUp = (dados) => api.post('/user', dados);

export const currentUser = async () => (await api.get('/user')).data.user;

// O Back-End não tem rota de logout: o JWT é descartado no navegador.
export function signOut() {
    try {
        localStorage.removeItem(TOKEN_KEY);
    } catch {
        /* sem storage */
    }
}
