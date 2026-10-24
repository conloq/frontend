import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const client = readFileSync('public/js/app.js', 'utf8');
const controller = readFileSync('controllers/pageController.js', 'utf8');
const profile = readFileSync('views/profile.ejs', 'utf8');
assert.doesNotMatch(client, /\bfetch\s*\(/);
assert.doesNotMatch(client, /mash-token|Authorization:\s*`Bearer/);
assert.match(profile, /action="\/profile\/photo" method="post" enctype="multipart\/form-data"/);
assert.match(profile, /name="image" type="file"/);
assert.match(controller, /req\.is\('multipart\/form-data'\)/);
assert.match(controller, /chamarUpload\(req, req\.session\.token\)/);
assert.match(controller, /body: req,/);
assert.match(controller, /fetch\(urlApi\('\/user\/upload'\),/);
console.log(
    'PASS upload: form multipart envia ao controller, que encaminha o arquivo com a sessão.'
);
