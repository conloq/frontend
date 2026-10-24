import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import ejs from 'ejs';
import pageController from '../controllers/pageController.js';

const client = readFileSync('public/js/app.js', 'utf8');
const controller = readFileSync('controllers/pageController.js', 'utf8');
const runtime = readFileSync('index.js', 'utf8');
const dependencies = JSON.parse(readFileSync('package.json', 'utf8')).dependencies;
assert.doesNotMatch(client, /\bfetch\s*\(/);
assert.doesNotMatch(client, /mash-token|Authorization:\s*`Bearer|\/_api/);
assert.ok(dependencies['express-mysql-session']);
assert.match(runtime, /createDatabaseTable: false/);
assert.match(runtime, /mysql\.createPool/);
assert.match(runtime, /SESSION_DB_SSL_CA/);
assert.match(runtime, /endConnectionOnClose: true/);
assert.match(runtime, /await sessionStore\.length\(\)/);
assert.match(runtime, /store: sessionStore/);
for (const route of [
    /router\.post\(\s*'\/profile'/,
    /router\.post\(\s*'\/recipes'/,
    /router\.post\(\s*'\/recipes\/:id'/,
    /router\.post\(\s*'\/recipes\/:id\/temperatures'/,
])
    assert.match(controller, route);
assert.match(readFileSync('views/recipes.ejs', 'utf8'), /action="\/recipes" method="post"/);
assert.match(readFileSync('views/temperatureForm.ejs', 'utf8'), /method="post"/);
const sidebarView = readFileSync('views/partials/sidebar.ejs', 'utf8');
assert.match(
    sidebarView,
    /localStorage\.getItem\('mash-sidebar-collapsed'\)[\s\S]*?<\/script>\s*<aside id="appSidebar"/
);
assert.match(
    readFileSync('public/css/tailwind.css', 'utf8'),
    /body\.sidebar-collapsed #appSidebar/
);
let classeSidebarInicial;
runInNewContext(sidebarView.match(/<script>([\s\S]*?)<\/script>/)[1], {
    localStorage: { getItem: () => 'true' },
    document: { body: { classList: { add: (classe) => (classeSidebarInicial = classe) } } },
});
assert.equal(classeSidebarInicial, 'sidebar-collapsed');

// API_URL is read after the controller import, like .env loaded by index.js.
const signup = pageController.stack.find(
    (layer) => layer.route?.path === '/signup' && layer.route.methods.post
).route.stack[0].handle;
const apiUrlAnterior = process.env.API_URL;
const fetchAnterior = globalThis.fetch;
let urlChamado;
try {
    process.env.API_URL = 'http://api.example.test';
    globalThis.fetch = async (url) => {
        urlChamado = url;
        return { status: 201, json: async () => ({}) };
    };
    await signup(
        {
            body: {
                name: 'Teste',
                email: 'teste@example.test',
                password: 'senha',
                confirmarSenha: 'senha',
            },
            session: {},
        },
        { redirect() {} }
    );
    assert.equal(urlChamado, 'http://api.example.test/user');
} finally {
    globalThis.fetch = fetchAnterior;
    if (apiUrlAnterior === undefined) delete process.env.API_URL;
    else process.env.API_URL = apiUrlAnterior;
}

const logout = pageController.stack.find(
    (layer) => layer.route?.path === '/logout' && layer.route.methods.get
).route.stack[0].handle;
await assert.rejects(
    logout(
        { session: { destroy: (callback) => callback(new Error('session store failed')) } },
        { clearCookie() {}, redirect() {} }
    ),
    /session store failed/
);

// Exercita o mesmo controle de foco usado pelos modais e pela confirmação.
const listeners = new Map();
const doc = {
    querySelector: () => null,
    querySelectorAll: () => [],
    addEventListener: (type, handler) => listeners.set(type, handler),
    removeEventListener: (type) => listeners.delete(type),
};
const previous = {
    focus() {
        doc.activeElement = this;
    },
};
const button = () => ({
    tabIndex: 0,
    getClientRects: () => [1],
    focus() {
        doc.activeElement = this;
    },
});
const first = button();
const last = button();
const sibling = { inert: false };
const alreadyInert = { inert: true };
const modal = {
    querySelectorAll: () => [first, last],
    contains: (el) => [first, last].includes(el),
    getAttribute: () => null,
    removeAttribute() {},
    focus() {
        doc.activeElement = this;
    },
};
const parent = { parentElement: null, children: [modal, sibling, alreadyInert] };
modal.parentElement = parent;
doc.activeElement = previous;
const shell = { document: doc };
runInNewContext(readFileSync('public/js/script.js', 'utf8'), shell);
const release = shell.prenderFoco(modal);
assert.equal(sibling.inert, true);
doc.activeElement = last;
let prevented = false;
listeners.get('keydown')({
    key: 'Tab',
    preventDefault() {
        prevented = true;
    },
});
assert.equal(prevented, true);
assert.equal(doc.activeElement, first);
listeners.get('keydown')({ key: 'Tab', shiftKey: true, preventDefault() {} });
assert.equal(doc.activeElement, last);
first.disabled = last.disabled = true;
listeners.get('keydown')({ key: 'Tab', preventDefault() {} });
assert.equal(doc.activeElement, modal);
release();
assert.equal(sibling.inert, false);
assert.equal(alreadyInert.inert, true);
assert.equal(doc.activeElement, previous);
assert.equal(listeners.has('keydown'), false);

for (const name of ['login', 'signup', 'profile']) {
    assert.match(readFileSync(`views/${name}.ejs`, 'utf8'), /<form[^>]+method="post"/);
}
for (const dir of ['views', 'views/partials']) {
    for (const file of readdirSync(dir).filter((name) => name.endsWith('.ejs'))) {
        const filename = `${dir}/${file}`;
        const source = readFileSync(filename, 'utf8');
        ejs.compile(source, { filename });
        const markup = source.replace(/<%[\s\S]*?%>/g, 'x');
        for (const [input] of markup.matchAll(/<input\b[^>]*>/gi)) {
            const type = input.match(/\btype="([^"]+)"/i)?.[1] ?? 'text';
            if (['email', 'number', 'password', 'search', 'tel', 'text', 'url'].includes(type))
                assert.match(
                    input,
                    /\bplaceholder="[^"]+"/i,
                    `${filename}: ${type} input precisa de placeholder`
                );
        }
    }
}
const rampaEditada = await ejs.renderFile('views/temperatureForm.ejs', {
    user: { name: 'Teste', email: 'teste@example.test' },
    recipe: { id: 7, name: 'Receita' },
    temperatura: {},
    id: '7',
    editando: true,
});
assert.match(rampaEditada, /data-sem-api="conloq\/mash#97"[^>]*>[^<]*<i[^>]*><\/i>Excluir rampa/);

// /recipes/:id/edit abre o modal de renomear e volta para o detalhe ao fechar
const receitaRenomear = await ejs.renderFile('views/recipe.ejs', {
    user: { name: 'Teste', email: 'teste@example.test' },
    abrirRenomear: true,
    id: '7',
    recipe: { id: '7', name: 'Receita' },
    rampas: [],
});
assert.match(receitaRenomear, /id="modalRenomear"[^>]+data-abrir data-voltar="\/recipes\/7"/);

const voltarLoteMalicioso = await ejs.renderFile('views/partials/modalLote.ejs', {
    editando: true,
    abrir: true,
    voltar: '/lots/" onmouseover="alert(1)',
    receitas: [],
});
assert.match(voltarLoteMalicioso, /data-voltar="\/lots\/&#34; onmouseover=&#34;alert\(1\)"/);
assert.doesNotMatch(voltarLoteMalicioso, /data-voltar="[^"]*" onmouseover=/);

// Menu ativo: vence a seção mais longa (sessão do iodo acende "Teste de iodo", não "Lotes")
const menuAtivo = (pathname) => {
    const links = Object.entries({
        Lotes: '/lots',
        Iodo: '/analyses /lots/*/iodine',
        Receitas: '/recipes /temperatures',
    }).map(([nome, secao]) => ({
        nome,
        ativo: false,
        dataset: { secao },
        classList: {
            add() {
                this.dono.ativo = true;
            },
        },
        setAttribute() {},
        querySelector: () => null,
    }));
    links.forEach((link) => (link.classList.dono = link));
    const docMenu = {
        querySelector: () => null,
        querySelectorAll: (sel) => (sel === '.menu-link[data-secao]' ? links : []),
        addEventListener() {},
    };
    runInNewContext(readFileSync('public/js/script.js', 'utf8'), {
        document: docMenu,
        window: { location: { pathname } },
    });
    return links.filter((link) => link.ativo).map((link) => link.nome);
};
assert.deepEqual(menuAtivo('/lots/3/iodine/reading'), ['Iodo']);
assert.deepEqual(menuAtivo('/lots/3'), ['Lotes']);
assert.deepEqual(menuAtivo('/recipes/2/iodine'), ['Receitas']);
assert.deepEqual(menuAtivo('/login'), []);
console.log('PASS: API_URL, sessão, POST, perfil, foco, formulários, menu ativo e EJS escapado.');
