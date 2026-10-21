import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import ejs from 'ejs';

const source = readFileSync('public/js/app.js', 'utf8').replace(
    '    // ------------------------------------------------------------ guarda de rota',
    '    globalThis.audit = { api, linhaReceita, carregarUsuario };\n    // ------------------------------------------------------------ guarda de rota'
);
const storage = new Map();
let fetch;
let select = () => null;
let each = () => [];
const context = {
    window: { API_URL: 'http://api.test' },
    FormData: class {},
    AbortSignal,
    location: { pathname: '/login', href: '', replace() {} },
    localStorage: {
        getItem: (key) => storage.get(key),
        setItem: (key, value) => storage.set(key, value),
        removeItem: (key) => storage.delete(key),
    },
    document: {
        querySelector: (...args) => select(...args),
        querySelectorAll: (...args) => each(...args),
    },
    fetch: (...args) => fetch(...args),
};
runInNewContext(source, context);
const { api, linhaReceita, carregarUsuario } = context.audit;
let respond;
fetch = () =>
    new Promise((resolve) => {
        respond = resolve;
    });
storage.set('mash-token', 'old-token');
const pending = api('GET', '/user');
storage.set('mash-token', 'new-token');
respond({ status: 401, json: async () => ({}) });
await pending;
assert.equal(storage.get('mash-token'), 'new-token');
assert.equal(context.location.href, '');
fetch = async () => ({ status: 401, json: async () => ({}) });
await api('GET', '/user');
assert.equal(storage.has('mash-token'), false);
assert.equal(context.location.href, '/login');

const controller = new AbortController();
context.AbortSignal = {
    timeout(ms) {
        assert.equal(ms, 15000);
        return controller.signal;
    },
};
fetch = (_url, { signal }) =>
    new Promise((_resolve, reject) => {
        signal.addEventListener('abort', () => reject(signal.reason), { once: true });
    });
const timedOut = api('POST', '/recipes', { name: 'Test' });
controller.abort(new DOMException('timeout', 'TimeoutError'));
const result = await timedOut;
assert.equal(result.status, 503);
assert.match(result.data.error, /pode ter sido salva/);
fetch = async () => ({
    status: 200,
    json: async () => {
        throw controller.signal.reason;
    },
});
assert.match((await api('GET', '/user')).data.error, /demorou/);
context.AbortSignal = AbortSignal;

let slots;
const row = { querySelector: () => ({ classList: { replace() {} }, addEventListener() {} }) };
context.document.getElementById = () => ({
    content: { cloneNode: () => ({ firstElementChild: row }) },
});
row.querySelector = (selector) => ({
    classList: { replace() {} },
    addEventListener() {},
    remove() {},
    set textContent(value) {
        if (selector === '[data-slot="faixa"]') slots = value;
    },
    setAttribute() {},
});
linhaReceita({ receita: { id: 1, name: 'Test' }, rampas: null });
assert.equal(slots, 'Não foi possível carregar');
linhaReceita({ receita: { id: 1, name: 'Test' }, rampas: [] });
assert.equal(slots, 'Sem rampas');

const save = { disabled: false };
const fields = Object.fromEntries(
    ['name', 'email', 'phone', 'password', 'confirmarSenha'].map((key) => [key, { value: '' }])
);
const profile = { elements: fields, querySelectorAll: () => [] };
select = (selector) =>
    selector === '#btnSalvar' ? save : selector === '#formPerfil' ? profile : null;
fetch = async () => ({ status: 503, json: async () => ({ error: 'offline' }) });
await carregarUsuario();
assert.equal(save.disabled, true);
fetch = async () => ({
    status: 200,
    json: async () => ({ user: { name: 'Saved', email: 'a@b.test' } }),
});
await carregarUsuario();
assert.equal(save.disabled, false);
assert.equal(fields.name.value, 'Saved');

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

for (const name of ['login', 'cadastro', 'usuario']) {
    assert.match(readFileSync(`views/${name}.ejs`, 'utf8'), /<form[^>]+method="post"/);
}
for (const dir of ['views', 'views/partials']) {
    for (const file of readdirSync(dir).filter((name) => name.endsWith('.ejs'))) {
        const filename = `${dir}/${file}`;
        ejs.compile(readFileSync(filename, 'utf8'), { filename });
    }
}
for (const file of readdirSync('views').filter((name) => name.endsWith('.ejs'))) {
    await ejs.renderFile(`views/${file}`, { apiUrl: 'http://localhost:8080', editando: false });
}
await ejs.renderFile('views/temperatureForm.ejs', {
    apiUrl: 'http://localhost:8080',
    editando: true,
});
console.log('PASS: sessão, timeout, rampas, perfil, foco, formulários e renderização EJS.');
