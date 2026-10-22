import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
const file = { name: 'profile.png', type: 'image/png' };
const form = {
    addEventListener(type, fn) {
        if (type === 'submit') this.submit = fn;
    },
};
const calls = [];
const photo = { src: '' };
class FormDataMock {
    constructor() {
        this.values = [];
    }
    append(...value) {
        this.values.push(value);
    }
}
const location = {
    pathname: '/profile',
    href: '',
    replace() {
        throw new Error('redirect inesperado');
    },
};
const storage = new Map([['mash-token', 'test-token']]);
const source = readFileSync(
    process.argv[2] ?? new URL('../public/js/app.js', import.meta.url),
    'utf8'
);
runInNewContext(source, {
    window: { API_URL: 'http://api.test' },
    location,
    FormData: FormDataMock,
    AbortSignal,
    localStorage: {
        getItem: (k) => storage.get(k),
        setItem: (k, v) => storage.set(k, v),
        removeItem: (k) => storage.delete(k),
    },
    document: {
        querySelector: (s) =>
            s === '#formFoto' ? form : s === '#inputFoto' ? { files: [file] } : null,
        querySelectorAll: (selector) => (selector === '[data-user="urlImage"]' ? [photo] : []),
    },
    fetch: async (url, options) => {
        calls.push({ url, ...options });
        return {
            status: 200,
            json: async () => ({
                message: 'Imagem enviada com sucesso!',
                url: 'https://example.test/photo.png',
            }),
        };
    },
});
await new Promise(setImmediate);
await form.submit({ preventDefault() {} });
const call = calls.find((c) => c.method === 'PUT');
assert.equal(call.url, 'http://api.test/user/upload');
assert.equal(call.headers.Authorization, 'Bearer test-token');
assert.equal(call.headers['Content-Type'], undefined);
assert.equal(call.body.values.length, 1);
assert.equal(call.body.values[0][0], 'image');
assert.equal(call.body.values[0][1], file);
assert.equal(location.href, '');
assert.equal(photo.src, 'https://example.test/photo.png');
console.log(
    'PASS upload: image, multipart sem Content-Type manual, Bearer e foto atualizada sem redirecionar'
);
