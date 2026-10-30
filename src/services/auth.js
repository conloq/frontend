import { api, mensagemErro, TOKEN_KEY } from '@/services/api';
// Serviço de Autenticação

// Função que coleta o token do localStorage do navegador
export const getAxiosConfig = () => ({
    headers: {
        Authorization: `Bearer ${
            typeof window !== 'undefined' ? (localStorage.getItem(TOKEN_KEY) ?? '') : ''
        }`,
    },
});

// Função que realiza o login
export const login = async (email, password) => {
    try {
        const response = await api.post('/login', { email: email.trim(), password });
        // Armazenando o token devolvido pela API
        localStorage.setItem(TOKEN_KEY, response.data.token);
        return { success: true };
    } catch (error) {
        return { success: false, message: mensagemErro(error, 'Não foi possível entrar.') };
    }
};

// Função que realiza logout (o Back-End não tem rota de logout: o token é descartado no navegador)
export const logout = (router) => {
    localStorage.removeItem(TOKEN_KEY);
    router.push('/login');
};

// Função que cadastra um usuário
export const signUp = (dados) => api.post('/user', dados);

// Função que busca o usuário logado
export const currentUser = async () => (await api.get('/user', getAxiosConfig())).data.user;
