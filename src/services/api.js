import axios from 'axios';

export const TOKEN_KEY = 'mash_token';

const lerToken = () => {
    try {
        return localStorage.getItem(TOKEN_KEY);
    } catch {
        return null;
    }
};

export const temToken = () => Boolean(lerToken());

export const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080',
    timeout: 15000,
});

// 401 em rota autenticada: sessão vencida, volta para o login. O 401 do próprio login é só mensagem.
api.interceptors.response.use(undefined, (error) => {
    if (error.response?.status === 401 && error.config?.url !== '/login') {
        try {
            localStorage.removeItem(TOKEN_KEY);
        } catch {
            /* sem storage */
        }
        window.location.assign('/login');
    }
    return Promise.reject(error);
});

// Mensagem da API como veio (pt-BR): o 400 do login responde em message, os demais em error.
export const mensagemErro = (error, padrao = 'Não foi possível conectar ao servidor.') =>
    error.response?.data?.error ?? error.response?.data?.message ?? padrao;
