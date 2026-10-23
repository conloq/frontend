import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

try {
    process.loadEnvFile();
} catch {
    // .env é opcional: as variáveis podem vir do ambiente
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// Define o EJS como renderizador de páginas
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
// Endereço da API: o navegador (public/js/app.js) é quem chama
app.locals.apiUrl = process.env.API_URL ?? 'http://localhost:8080';

// Arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));
app.use(
    '/vendor/phosphor',
    express.static(path.join(__dirname, 'node_modules/@phosphor-icons/web'))
);

// Telas: o index.js só entrega as páginas. Login, token, dados e erros
// ficam em public/js/app.js, que consome a API do Back-End.
// Os parâmetros da URL (ex.: id do lote) vão para a view só para montar links.
const tela =
    (view, dados = {}) =>
    (req, res) =>
        res.render(view, { ...dados, ...req.params });

app.get('/', (req, res) => res.redirect('/dashboard'));
app.get('/login', tela('login'));
app.get('/signup', tela('signup'));
// Recuperar senha: sem rota na API; os formulários usam data-sem-api
app.get('/forgot-password', tela('forgotPassword', { etapa: 'email' }));
app.get('/forgot-password/code', tela('forgotPassword', { etapa: 'codigo' }));
app.get('/forgot-password/reset', tela('forgotPassword', { etapa: 'redefinir' }));
app.get('/logout', (req, res) => res.redirect('/login')); // o app.js limpa o token
app.get('/dashboard', tela('dashboard')); // sem rota na API: estados vazios
app.get('/profile', tela('profile'));
app.get('/profile/access-history', tela('accessHistory')); // mobile: lista própria, aberta pelo Perfil
// Configuração: salvar ainda não tem rota na API (o formulário usa data-sem-api)
app.get('/settings', tela('settings', { aba: 'acessibilidade' }));
app.get('/settings/security', tela('settings', { aba: 'seguranca' }));
app.get('/recipes', tela('recipes'));
app.get('/recipes/:id', tela('recipe'));
app.get('/recipes/:id/edit', tela('recipe'));
// Teste de iodo da receita: salvar sem rota na API (conloq/mash#101)
app.get('/recipes/:id/iodine', tela('recipeIodine')); // mesma tela: renomear e editar/excluir rampas
app.get('/recipes/:id/temperatures/new', tela('temperatureForm', { editando: false }));
// Editar e excluir rampa ainda não têm rota na API (conloq/mash#97): a tela carrega a rampa e avisa ao salvar
app.get(
    '/recipes/:id/temperatures/:temperatureId/edit',
    tela('temperatureForm', { editando: true })
);
// Lotes e sessão do iodo: sem rota na API; telas com estados vazios e formulários data-sem-api
app.get('/lots', tela('lots'));
app.get('/lots/new', tela('lots', { abrirLote: true })); // lista com o modal de novo lote aberto
app.get('/lots/:id', tela('lot'));
app.get('/lots/:id/edit', tela('lot', { abrirLote: true })); // detalhe com o modal de edição aberto
app.get('/lots/:id/monitoring', tela('lotMonitoring'));
app.get('/lots/:id/iodine', tela('iodineSession', { etapa: 'preparar' }));
app.get('/lots/:id/iodine/reading', tela('iodineSession', { etapa: 'leitura' }));
app.get('/analyses/new', tela('iodineDemo')); // demonstração simulada; leitura real ainda indisponível (#34)
app.get('/analyses/:id', tela('analysis'));

// Inicia o servidor.
// Sem callback no listen: o Express 5 liga o callback ao evento 'error'
// (lib/application.js), o que faria o log de sucesso disparar num bind falho.
const port = Number(process.env.PORT) || 4000;
const server = app.listen(port);

server.on('listening', () => {
    console.log(`Servidor iniciado com sucesso em http://localhost:${port}`);
});

server.on('error', (erro) => {
    console.error('Ocorreu um erro ao iniciar o servidor:', erro.message);
    process.exitCode = 1;
});
