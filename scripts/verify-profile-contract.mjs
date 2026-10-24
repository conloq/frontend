import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ejs from 'ejs';

const user = {
    name: '<script>alert(1)</script>',
    email: 'profile@example.test',
    phone: '11988887777',
    createdAt: '2026-01-02T12:00:00.000Z',
    urlImage: 'https://images.example.test/profile.png',
};
const html = await ejs.renderFile('views/profile.ejs', {
    user,
    acessos: [],
    erroAcessos: false,
    flash: null,
});
assert.match(html, /value="&lt;script&gt;alert\(1\)&lt;\/script&gt;"/);
assert.match(html, /value="profile@example\.test"/);
assert.match(html, /value="11988887777"/);
assert.match(html, /src="https:\/\/images\.example\.test\/profile\.png"/);
assert.match(html, /Nenhum acesso registrado/);
assert.doesNotMatch(html, /data-user=/);

const client = readFileSync('public/js/app.js', 'utf8');
assert.doesNotMatch(client, /\bfetch\s*\(/);
assert.doesNotMatch(client, /mash-token|Authorization:\s*`Bearer/);

const controller = readFileSync('controllers/pageController.js', 'utf8');
assert.match(controller, /router\.post\(\s*'\/profile'/);
assert.match(controller, /chamarApi\(req\.session\.token, '\/user', 'PUT'/);
assert.match(controller, /res\.render\('profile',\s*\{\s*user: req\.user/s);
assert.match(html, /<form id="formPerfil" action="\/profile" method="post"/);
console.log('PASS: Perfil recebe user via EJS escapado e envia alterações ao controller por POST.');
