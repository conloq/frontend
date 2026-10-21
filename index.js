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
const tela =
    (view, dados = {}) =>
    (req, res) =>
        res.render(view, dados);

app.get('/', (req, res) => res.redirect('/recipes'));
app.get('/login', tela('login'));
app.get('/cadastro', tela('cadastro'));
app.get('/logout', (req, res) => res.redirect('/login')); // o app.js limpa o token
app.get('/usuario', tela('usuario'));
app.get('/recipes', tela('recipes'));
app.get('/recipes/:id', tela('recipe'));
app.get('/recipes/:id/edit', tela('recipe')); // mesma tela: renomear e editar/excluir rampas
app.get('/recipes/:id/temperatures/new', tela('temperatureForm', { editando: false }));
// Editar e excluir rampa ainda não têm rota na API (conloq/mash#97): a tela carrega a rampa e avisa ao salvar
app.get(
    '/recipes/:id/temperatures/:temperatureId/edit',
    tela('temperatureForm', { editando: true })
);
// Lotes e teste de iodo: telas com dados de exemplo até a API ter as rotas (#31, #33, #1, #3)
app.get('/lots', tela('lots'));
app.get('/lots/:id', tela('lot'));
app.get('/analyses/new', tela('iodineDemo')); // demonstração com dados falsos; a leitura real é do OpenCV (#34)
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
