import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

const ler = (caminho) => readFile(new URL(`../${caminho}`, import.meta.url), 'utf8');

test('o React chama a API direto com Bearer, sem controller ou sessão no frontend', async () => {
    const api = await ler('src/services/api.js');
    assert.match(api, /axios\.create/);
    assert.match(api, /NEXT_PUBLIC_API_URL/);
    const auth = await ler('src/services/auth.js');
    assert.match(auth, /export const getAxiosConfig/);
    assert.match(auth, /Authorization: `Bearer/);
    assert.match(api, /status === 401/);
    await assert.rejects(ler('controllers/pageController.js'), { code: 'ENOENT' });
    await assert.rejects(ler('index.js'), { code: 'ENOENT' });
});

test('toda chamada das telas à API leva o token por getAxiosConfig()', async () => {
    const telas = [
        'LotContent',
        'LotsContent',
        'ProfileContent',
        'RecipeContent',
        'RecipesContent',
        'TemperatureContent',
    ];
    for (const tela of telas) {
        const codigo = await ler(`src/components/${tela}/index.js`);
        const chamadas = codigo.match(/\bapi\s*\.(get|post|put|delete)\(/g) ?? [];
        const comToken = codigo.match(/getAxiosConfig\(\),?\s*\)/g) ?? [];
        assert.equal(comToken.length, chamadas.length, tela);
    }
});

test('login autentica no Back-End e o shell confere o usuário pela API', async () => {
    const login = await ler('src/components/LoginContent/index.js');
    const auth = await ler('src/services/auth.js');
    const shell = await ler('src/components/AppShell/index.js');
    assert.match(login, /await login\(email/);
    assert.match(auth, /api\.post\('\/login'/);
    assert.match(auth, /api\.get\('\/user', getAxiosConfig\(\)\)/);
    assert.match(shell, /currentUser\(\)/);
});

test('validação de rampa segue as regras da API', async () => {
    const { validarRampa } = await import('../src/services/rampa.js');
    const valida = {
        minTemperatureRamp: '64',
        maxTemperatureRamp: '68',
        minTemperatureLimit: '62',
        maxTemperatureLimit: '70',
        timer: '00:40',
        initialization: '00:10:00',
        idealTime: '00:30:00',
        orderRamp: '',
    };
    assert.deepEqual(validarRampa(valida), {});
    const erros = validarRampa({
        ...valida,
        maxTemperatureRamp: '60',
        minTemperatureLimit: '101',
        timer: '25:00:00',
    });
    assert.deepEqual(Object.keys(erros).sort(), [
        'maxTemperatureRamp',
        'minTemperatureLimit',
        'timer',
    ]);
});

test('flash nunca injeta HTML', async () => {
    const fontes = await Promise.all(
        ['Feedback', 'ProfileContent', 'RecipesContent', 'RecipeContent'].map((nome) =>
            ler(`src/components/${nome}/index.js`)
        )
    );
    fontes.forEach((fonte) => assert.doesNotMatch(fonte, /dangerouslySetInnerHTML/));
});
