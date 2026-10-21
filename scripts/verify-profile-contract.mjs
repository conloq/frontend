import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import ejs from 'ejs';

const profile = {
    elements: Object.fromEntries(
        ['name', 'email', 'phone', 'password'].map((name) => [name, { value: '' }])
    ),
    addEventListener(type, handler) {
        if (type === 'submit') this.submit = handler;
    },
};
const photo = { src: '/img/foto-perfil.png' };
const calls = [];
class FormDataMock {
    constructor(form) {
        this.values = Object.entries(form.elements).map(([key, field]) => [key, field.value]);
    }
    [Symbol.iterator]() {
        return this.values[Symbol.iterator]();
    }
}
const storage = new Map([['mash-token', 'test-token']]);
const location = {
    pathname: '/usuario',
    href: '',
    replace() {
        throw new Error('Unexpected redirect');
    },
};
const source = process.argv[2]
    ? readFileSync(process.argv[2], 'utf8')
    : readFileSync(new URL('../public/js/app.js', import.meta.url), 'utf8');
runInNewContext(source, {
    window: { API_URL: 'http://api.test' },
    location,
    FormData: FormDataMock,
    localStorage: {
        getItem: (key) => storage.get(key),
        setItem: (key, value) => storage.set(key, value),
        removeItem: (key) => storage.delete(key),
    },
    document: {
        querySelector: (selector) => (selector === '#formPerfil' ? profile : null),
        querySelectorAll: (selector) => (selector === '[data-user="urlImage"]' ? [photo] : []),
    },
    fetch: async (url, options) => {
        calls.push({ url, ...options });
        return {
            status: 200,
            json: async () =>
                options.method === 'GET'
                    ? {
                          user: {
                              name: 'Schema test',
                              email: 'profile@example.test',
                              phone: '11988887777',
                              urlImage: 'https://images.example.test/profile.png',
                          },
                      }
                    : { message: 'Usuário atualizado com sucesso' },
        };
    },
});
await new Promise(setImmediate);
assert.equal(photo.src, 'https://images.example.test/profile.png');
assert.equal(profile.elements.phone.value, '11988887777');
await profile.submit({ preventDefault() {}, target: profile });
const update = calls.find((call) => call.method === 'PUT');
assert.equal(update.url, 'http://api.test/user');
assert.equal(update.headers.Authorization, 'Bearer test-token');
assert.deepEqual(JSON.parse(update.body), {
    name: 'Schema test',
    email: 'profile@example.test',
    phone: '11988887777',
});
assert.equal(location.href, '/usuario');
for (const file of ['../views/usuario.ejs', '../views/partials/topBar.ejs']) {
    const url = new URL(file, import.meta.url);
    const template = readFileSync(url, 'utf8');
    ejs.compile(template, { filename: url.pathname });
    assert.match(template, /data-user="urlImage"/);
    assert.doesNotMatch(template, /data-user="url_image"/);
    if (file.endsWith('usuario.ejs')) {
        assert.match(template, /name="phone"/);
        assert.match(template, /id="telefone"/);
        assert.match(template, /Telefone/);
    }
}
console.log(
    'PASS: foto e telefone lidos em camelCase, PUT envia phone com Bearer e templates preservam rotulos/IDs.'
);
