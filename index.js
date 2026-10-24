// code-wiki:start
// Summary: Start the EJS frontend with MySQL-backed sessions and page routes.
// Description: Session database connection settings come from environment variables, with optional TLS configuration.
// Production startup requires a session secret and enables secure proxy-aware cookies.
// The MySQL session store is checked for readiness and readability before the server accepts traffic.
// Express serves public assets and Phosphor files, parses form and JSON bodies, and configures EJS views.
// The DW2 example renders a view with sample locals, then page routes are mounted on the application.
// The listener logs successful startup and reports bind failures through the server error event.
// code-wiki:end
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import MySQLStoreFactory from 'express-mysql-session';
import session from 'express-session';
import mysql from 'mysql2/promise';
import pageController from './controllers/pageController.js';

try {
    process.loadEnvFile();
} catch {
    // .env é opcional: as variáveis podem vir do ambiente
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
if (process.env.NODE_ENV === 'production' && !process.env.SESSION_SECRET) {
    throw new Error('SESSION_SECRET é obrigatório em produção.');
}
const MySQLStore = MySQLStoreFactory(session);
const sessionDb = {
    host: process.env.SESSION_DB_HOST,
    port: Number(process.env.SESSION_DB_PORT) || 3306,
    user: process.env.SESSION_DB_USER,
    password: process.env.SESSION_DB_PASSWORD,
    database: process.env.SESSION_DB_NAME,
};
if (Object.values(sessionDb).some((value) => !value)) {
    throw new Error(
        'Configure SESSION_DB_HOST, SESSION_DB_USER, SESSION_DB_PASSWORD e SESSION_DB_NAME.'
    );
}
const sessionSsl = process.env.SESSION_DB_SSL_CA
    ? { ca: process.env.SESSION_DB_SSL_CA.replace(/\\n/g, '\n') }
    : process.env.SESSION_DB_SSL === 'true' || process.env.NODE_ENV === 'production'
      ? {}
      : undefined;
const sessionPool = mysql.createPool({ ...sessionDb, ...(sessionSsl && { ssl: sessionSsl }) });
const sessionStore = new MySQLStore(
    { createDatabaseTable: false, endConnectionOnClose: true },
    sessionPool
);
try {
    await sessionStore.onReady();
    // Confere conexão, leitura e existência da tabela antes de aceitar tráfego.
    await sessionStore.length();
} catch (erro) {
    await sessionStore.close();
    throw new Error('Não foi possível conectar à tabela de sessões no MySQL.', { cause: erro });
}
if (process.env.NODE_ENV === 'production') app.set('trust proxy', 1);

// Define o EJS como renderizador de páginas
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(
    '/vendor/phosphor',
    express.static(path.join(__dirname, 'node_modules/@phosphor-icons/web'))
);
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(
    session({
        name: 'mash.sid',
        store: sessionStore,
        secret: process.env.SESSION_SECRET ?? 'mash-development-session-secret',
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000,
        },
    })
);

app.get('/', (req, res) => res.redirect('/dashboard'));
app.get('/dw2-example', (req, res) => {
    res.render('dw2Example', {
        titulo: 'Exemplo de DW2',
        listaClientes: ['Maria', 'João', 'Kevin'],
    });
});
app.use('/', pageController);

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
