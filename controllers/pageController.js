// code-wiki:start
// Summary: Atende as páginas do frontend no servidor EJS: autentica pela sessão, repete as chamadas à API e devolve as views já renderizadas.
// Description: O token guardado na sessão do servidor é o que autoriza cada chamada à API; o navegador nunca fala com a API diretamente.
// As rotas de tela exigem sessão viva, e as de entrada desviam para o login quando ela falta ou expirou.
// A falha da API vira mensagem de estado exibida uma vez na página seguinte, com o destino de retorno preservado.
// Cadastro e login são as duas ações sem token; as demais passam a identidade do usuário para a API.
// As telas de receita e de rampa carregam o detalhe e a lista de rampas em paralelo, e respondem 404 quando a receita não pertence a quem pediu.
// As telas de lote existem com estado vazio e sem chamada à API, porque a rota de lote ainda não existe no Back-End.
// O histórico de acessos é lido da API e, quando ela não responde, a tela é renderizada sem o histórico em vez de quebrar.
// code-wiki:end
import express from 'express';

const router = express.Router();
const urlApi = (caminho) => `${process.env.API_URL ?? 'http://localhost:8080'}${caminho}`;

async function chamarApi(token, caminho, metodo = 'GET', corpo) {
    try {
        const resposta = await fetch(urlApi(caminho), {
            method: metodo,
            signal: AbortSignal.timeout(15000),
            headers: {
                ...(token && { Authorization: `Bearer ${token}` }),
                ...(corpo && { 'Content-Type': 'application/json' }),
            },
            ...(corpo && { body: JSON.stringify(corpo) }),
        });
        const data = await resposta.json().catch(() => ({}));
        return { status: resposta.status, data };
    } catch {
        return { status: 503, data: { error: 'Não foi possível conectar ao servidor' } };
    }
}

function flash(req, tipo, texto, extra = {}) {
    req.session.flash = { tipo, texto, ...extra };
}

function consumirFlash(req, res, next) {
    res.locals.flash = req.session?.flash ?? null;
    if (req.session) delete req.session.flash;
    next();
}

async function usuarioAtual(req) {
    if (!req.session?.token) return { status: 401 };
    return chamarApi(req.session.token, '/user');
}

function encerrarSessao(req) {
    return new Promise((resolve, reject) =>
        req.session.destroy((erro) => (erro ? reject(erro) : resolve()))
    );
}

function proteger(handler) {
    return async (req, res, next) => {
        const resultado = await usuarioAtual(req);
        if (resultado.status === 401) {
            await encerrarSessao(req);
            res.clearCookie('mash.sid');
            return res.redirect('/login');
        }
        if (resultado.status !== 200 || !resultado.data.user) {
            return res.status(503).render('erroServidor', {
                mensagem: resultado.data?.error ?? 'Não foi possível carregar seus dados.',
            });
        }
        req.user = resultado.data.user;
        res.locals.user = req.user;
        try {
            await handler(req, res, next);
        } catch (erro) {
            next(erro);
        }
    };
}

function redirecionarSeLogado(req, res, next) {
    if (req.session?.token) return res.redirect('/dashboard');
    next();
}

router.use(consumirFlash);

router.get('/login', redirecionarSeLogado, (req, res) => res.render('login'));
router.get('/signup', redirecionarSeLogado, (req, res) => res.render('signup'));
router.get('/forgot-password', redirecionarSeLogado, (req, res) =>
    res.render('forgotPassword', { etapa: 'email' })
);
router.get('/forgot-password/code', redirecionarSeLogado, (req, res) =>
    res.render('forgotPassword', { etapa: 'codigo' })
);
router.get('/forgot-password/reset', redirecionarSeLogado, (req, res) =>
    res.render('forgotPassword', { etapa: 'redefinir' })
);

router.post('/login', async (req, res, next) => {
    try {
        const resultado = await chamarApi(null, '/login', 'POST', {
            email: String(req.body.email ?? '').trim(),
            password: String(req.body.password ?? ''),
        });
        if (resultado.status !== 200 || !resultado.data.token) {
            flash(
                req,
                'danger',
                resultado.data?.error ?? resultado.data?.message ?? 'Não foi possível entrar.'
            );
            return res.redirect('/login');
        }
        await new Promise((resolve, reject) =>
            req.session.regenerate((erro) => (erro ? reject(erro) : resolve()))
        );
        req.session.token = resultado.data.token;
        res.redirect('/dashboard');
    } catch (erro) {
        next(erro);
    }
});

router.post('/signup', async (req, res) => {
    const { name, email, password } = req.body;
    if (password !== req.body.confirmarSenha) {
        flash(req, 'danger', 'As senhas não conferem.');
        return res.redirect('/signup');
    }
    const resultado = await chamarApi(null, '/user', 'POST', { name, email, password });
    if (resultado.status !== 201) {
        flash(req, 'danger', resultado.data?.error ?? 'Não foi possível cadastrar.');
        return res.redirect('/signup');
    }
    flash(req, 'success', resultado.data?.message ?? 'Usuário criado com sucesso.');
    res.redirect('/login');
});

router.get('/logout', async (req, res) => {
    if (req.session) await encerrarSessao(req);
    res.clearCookie('mash.sid');
    res.redirect('/login');
});

async function chamarUpload(req, token) {
    try {
        const resposta = await fetch(urlApi('/user/upload'), {
            method: 'PUT',
            signal: AbortSignal.timeout(15000),
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': req.headers['content-type'],
            },
            body: req,
            duplex: 'half',
        });
        const data = await resposta.json().catch(() => ({}));
        return { status: resposta.status, data };
    } catch {
        return { status: 503, data: { error: 'Não foi possível conectar ao servidor' } };
    }
}

async function tratarFalhaApi(req, res, resultado, destino, extra = {}) {
    if (resultado.status === 401) {
        await encerrarSessao(req);
        res.clearCookie('mash.sid');
        return res.redirect('/login');
    }
    flash(
        req,
        'danger',
        resultado.data?.error ?? resultado.data?.message ?? 'Não foi possível salvar os dados.',
        extra
    );
    res.redirect(303, destino);
}

router.post(
    '/profile',
    proteger(async (req, res) => {
        const { name, email, phone, password, confirmarSenha } = req.body;
        const values = { name, email, phone };
        if (!String(name ?? '').trim() || !String(email ?? '').trim()) {
            flash(req, 'danger', 'Informe seu nome e e-mail.', { values });
            return res.redirect(303, '/profile');
        }
        if (password && /\s/.test(password)) {
            flash(req, 'danger', 'A senha não pode conter espaços.', { values });
            return res.redirect(303, '/profile');
        }
        if (password && password !== confirmarSenha) {
            flash(req, 'danger', 'As senhas não conferem.', { values });
            return res.redirect(303, '/profile');
        }
        const resultado = await chamarApi(req.session.token, '/user', 'PUT', {
            ...values,
            ...(password && { password }),
        });
        if (resultado.status !== 200) {
            return tratarFalhaApi(req, res, resultado, '/profile', { values });
        }
        flash(req, 'success', resultado.data?.message ?? 'Usuário atualizado com sucesso.');
        res.redirect(303, '/profile');
    })
);

router.post(
    '/profile/photo',
    proteger(async (req, res) => {
        if (!req.is('multipart/form-data')) return res.sendStatus(400);
        const resultado = await chamarUpload(req, req.session.token);
        if (resultado.status !== 200) {
            return tratarFalhaApi(req, res, resultado, '/profile');
        }
        flash(req, 'success', resultado.data?.message ?? 'Imagem enviada com sucesso.');
        res.redirect(303, '/profile');
    })
);

router.post(
    '/profile/delete',
    proteger(async (req, res) => {
        const resultado = await chamarApi(req.session.token, '/user', 'DELETE');
        if (resultado.status !== 204) {
            return tratarFalhaApi(req, res, resultado, '/profile');
        }
        await new Promise((resolve, reject) =>
            req.session.regenerate((erro) => (erro ? reject(erro) : resolve()))
        );
        flash(req, 'success', 'Conta excluída.');
        res.redirect(303, '/login');
    })
);

router.post(
    '/recipes',
    proteger(async (req, res) => {
        const name = String(req.body.name ?? '').trim();
        const extra = { form: 'receita', values: { name } };
        if (!name) {
            flash(req, 'danger', 'Nome não pode estar vazio.', extra);
            return res.redirect(303, '/recipes');
        }
        const resultado = await chamarApi(req.session.token, '/recipes', 'POST', { name });
        if (resultado.status !== 201) {
            return tratarFalhaApi(req, res, resultado, '/recipes', extra);
        }
        flash(req, 'success', resultado.data?.message ?? 'Receita criada com sucesso.');
        res.redirect(303, '/recipes');
    })
);

router.post(
    '/recipes/:id/delete',
    proteger(async (req, res) => {
        const resultado = await chamarApi(req.session.token, `/recipes/${req.params.id}`, 'DELETE');
        if (resultado.status !== 204) {
            return tratarFalhaApi(req, res, resultado, `/recipes/${req.params.id}`);
        }
        flash(req, 'success', 'Receita excluída.');
        res.redirect(303, '/recipes');
    })
);

router.post(
    '/recipes/:id',
    proteger(async (req, res) => {
        const name = String(req.body.name ?? '').trim();
        const extra = { values: { name } };
        const voltar = `/recipes/${req.params.id}/edit`;
        if (!name) {
            flash(req, 'danger', 'Nome não pode estar vazio.', extra);
            return res.redirect(303, voltar);
        }
        const resultado = await chamarApi(req.session.token, `/recipes/${req.params.id}`, 'PUT', {
            name,
        });
        if (resultado.status !== 200) return tratarFalhaApi(req, res, resultado, voltar, extra);
        flash(req, 'success', resultado.data?.message ?? 'Receita atualizada com sucesso.');
        res.redirect(303, `/recipes/${req.params.id}`);
    })
);

router.post(
    '/recipes/:id/temperatures',
    proteger(async (req, res) => {
        const body = req.body;
        const keys = [
            'minTemperatureRamp',
            'maxTemperatureRamp',
            'minTemperatureLimit',
            'maxTemperatureLimit',
        ];
        const validos = keys.every((key) => /^\d+$/.test(body[key] ?? ''));
        const values = Object.fromEntries(
            [...keys, 'timer', 'initialization', 'idealTime', 'orderRamp'].map((key) => [
                key,
                body[key],
            ])
        );
        const voltar = `/recipes/${req.params.id}/temperatures/new`;
        if (!validos) {
            flash(req, 'danger', 'Preencha as quatro temperaturas com números inteiros.', {
                values,
            });
            return res.redirect(303, voltar);
        }
        const segundos = (hora) => (/^\d{2}:\d{2}$/.test(hora ?? '') ? `${hora}:00` : hora);
        const temperatura = {
            ...Object.fromEntries(keys.map((key) => [key, Number(body[key])])),
            timer: segundos(body.timer),
            initialization: segundos(body.initialization),
            idealTime: segundos(body.idealTime),
            ...(body.orderRamp && { orderRamp: Number(body.orderRamp) }),
        };
        const resultado = await chamarApi(
            req.session.token,
            `/recipes/${req.params.id}/temperatures`,
            'POST',
            temperatura
        );
        if (resultado.status !== 201) {
            return tratarFalhaApi(req, res, resultado, voltar, { values });
        }
        flash(req, 'success', resultado.data?.message ?? 'Temperatura criada com sucesso.');
        res.redirect(303, `/recipes/${req.params.id}`);
    })
);

router.get(
    '/dashboard',
    proteger(async (_req, res) => res.render('dashboard'))
);

router.get(
    '/profile',
    proteger(async (req, res) => {
        const historico = await chamarApi(req.session.token, '/user/login-history');
        res.render('profile', {
            user: req.user,
            acessos: historico.status === 200 ? (historico.data.loginHistory ?? []) : [],
            erroAcessos: historico.status !== 200 && historico.status !== 404,
        });
    })
);

router.get(
    '/profile/access-history',
    proteger(async (req, res) => {
        const historico = await chamarApi(req.session.token, '/user/login-history');
        res.render('accessHistory', {
            acessos: historico.status === 200 ? (historico.data.loginHistory ?? []) : [],
            erroAcessos: historico.status !== 200 && historico.status !== 404,
        });
    })
);

router.get(
    '/settings',
    proteger(async (_req, res) => res.render('settings', { aba: 'acessibilidade' }))
);
router.get(
    '/settings/security',
    proteger(async (_req, res) => res.render('settings', { aba: 'seguranca' }))
);

function faixaRampas(rampas) {
    if (!rampas.length) return '—';
    const min = Math.min(...rampas.map((rampa) => rampa.minTemperatureRamp));
    const max = Math.max(...rampas.map((rampa) => rampa.maxTemperatureRamp));
    return `${min} – ${max} ºC`;
}

router.get(
    '/recipes',
    proteger(async (req, res) => {
        const resposta = await chamarApi(req.session.token, '/recipes');
        if (resposta.status !== 200) {
            flash(req, 'danger', resposta.data?.error ?? 'Não foi possível carregar as receitas.');
            return res.redirect('/dashboard');
        }
        const receitas = await Promise.all(
            (resposta.data.recipes ?? []).map(async (receita) => {
                const rampas = await chamarApi(
                    req.session.token,
                    `/recipes/${receita.id}/temperatures`
                );
                const temperaturas = rampas.status === 200 ? (rampas.data.temperatures ?? []) : [];
                return {
                    ...receita,
                    rampas: rampas.status === 200 ? temperaturas : null,
                    faixa:
                        rampas.status === 200
                            ? faixaRampas(temperaturas)
                            : 'Não foi possível carregar',
                };
            })
        );
        res.render('recipes', { receitas });
    })
);

router.get(
    '/recipes/:id/edit',
    proteger(async (req, res) => {
        const [detalhe, listaRampas] = await Promise.all([
            chamarApi(req.session.token, `/recipes/${req.params.id}`),
            chamarApi(req.session.token, `/recipes/${req.params.id}/temperatures`),
        ]);
        if (detalhe.status !== 200 || !detalhe.data.recipe) {
            return res.status(detalhe.status === 404 ? 404 : 503).render('erroServidor', {
                mensagem: detalhe.data?.error ?? 'Não foi possível carregar a receita.',
            });
        }
        res.render('recipe', {
            id: req.params.id,
            recipe: detalhe.data.recipe,
            rampas: listaRampas.status === 200 ? (listaRampas.data.temperatures ?? []) : null,
            erroRampas: listaRampas.status !== 200,
            abrirRenomear: true,
        });
    })
);

router.get(
    '/recipes/:id',
    proteger(async (req, res) => {
        const [detalhe, listaRampas] = await Promise.all([
            chamarApi(req.session.token, `/recipes/${req.params.id}`),
            chamarApi(req.session.token, `/recipes/${req.params.id}/temperatures`),
        ]);
        if (detalhe.status !== 200 || !detalhe.data.recipe) {
            return res.status(detalhe.status === 404 ? 404 : 503).render('erroServidor', {
                mensagem: detalhe.data?.error ?? 'Não foi possível carregar a receita.',
            });
        }
        res.render('recipe', {
            id: req.params.id,
            recipe: detalhe.data.recipe,
            rampas: listaRampas.status === 200 ? (listaRampas.data.temperatures ?? []) : null,
            erroRampas: listaRampas.status !== 200,
            abrirRenomear: req.query.edit === '1',
        });
    })
);

router.get(
    '/recipes/:id/iodine',
    proteger(async (req, res) => {
        const [detalhe, listaRampas] = await Promise.all([
            chamarApi(req.session.token, `/recipes/${req.params.id}`),
            chamarApi(req.session.token, `/recipes/${req.params.id}/temperatures`),
        ]);
        if (detalhe.status !== 200 || listaRampas.status !== 200) {
            return res.status(503).render('erroServidor', {
                mensagem:
                    detalhe.data?.error ??
                    listaRampas.data?.error ??
                    'Não foi possível carregar os dados da receita.',
            });
        }
        res.render('recipeIodine', {
            id: req.params.id,
            recipe: detalhe.data.recipe,
            rampas: listaRampas.data.temperatures ?? [],
        });
    })
);

router.get(
    '/recipes/:id/temperatures/new',
    proteger(async (req, res) => {
        const detalhe = await chamarApi(req.session.token, `/recipes/${req.params.id}`);
        if (detalhe.status !== 200 || !detalhe.data.recipe) {
            return res.status(detalhe.status === 404 ? 404 : 503).render('erroServidor', {
                mensagem: detalhe.data?.error ?? 'Não foi possível carregar a receita.',
            });
        }
        res.render('temperatureForm', {
            id: req.params.id,
            recipe: detalhe.data.recipe,
            editando: false,
            temperatura: {},
        });
    })
);

router.get(
    '/recipes/:id/temperatures/:temperatureId/edit',
    proteger(async (req, res) => {
        const [detalhe, listaRampas] = await Promise.all([
            chamarApi(req.session.token, `/recipes/${req.params.id}`),
            chamarApi(req.session.token, `/recipes/${req.params.id}/temperatures`),
        ]);
        const temperatura =
            listaRampas.status === 200
                ? (listaRampas.data.temperatures ?? []).find(
                      (rampa) => String(rampa.id) === req.params.temperatureId
                  )
                : null;
        if (detalhe.status !== 200 || listaRampas.status !== 200 || !temperatura) {
            const status =
                detalhe.status === 404 ||
                listaRampas.status === 404 ||
                (listaRampas.status === 200 && !temperatura)
                    ? 404
                    : 503;
            return res.status(status).render('erroServidor', {
                mensagem:
                    detalhe.data?.error ??
                    listaRampas.data?.error ??
                    'Não foi possível carregar esta rampa.',
            });
        }
        res.render('temperatureForm', {
            id: req.params.id,
            recipe: detalhe.data.recipe,
            editando: true,
            temperatura: temperatura ?? {},
        });
    })
);

router.get(
    '/lots',
    proteger(async (_req, res) => res.render('lots'))
);
router.get(
    '/lots/new',
    proteger(async (req, res) => {
        const resposta = await chamarApi(req.session.token, '/recipes');
        res.render('lots', {
            abrirLote: true,
            receitas: resposta.status === 200 ? (resposta.data.recipes ?? []) : [],
            erroReceitas: resposta.status !== 200,
        });
    })
);
router.get(
    '/lots/:id',
    proteger(async (_req, res) => res.render('lot'))
);
router.get(
    '/lots/:id/edit',
    proteger(async (req, res) => {
        const resposta = await chamarApi(req.session.token, '/recipes');
        res.render('lot', {
            abrirLote: true,
            receitas: resposta.status === 200 ? (resposta.data.recipes ?? []) : [],
            erroReceitas: resposta.status !== 200,
            id: req.params.id,
        });
    })
);
router.get(
    '/lots/:id/monitoring',
    proteger(async (_req, res) => res.render('lotMonitoring'))
);
router.get(
    '/lots/:id/iodine',
    proteger(async (req, res) =>
        res.render('iodineSession', { id: req.params.id, etapa: 'preparar' })
    )
);
router.get(
    '/lots/:id/iodine/reading',
    proteger(async (req, res) =>
        res.render('iodineSession', { id: req.params.id, etapa: 'leitura' })
    )
);
router.get(
    '/analyses/new',
    proteger(async (_req, res) => res.render('iodineDemo'))
);
router.get(
    '/analyses/:id',
    proteger(async (_req, res) => res.render('analysis'))
);

export default router;
