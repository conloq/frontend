/* global prenderFoco, closeModal */
// Consumo da API do Back-End direto do navegador (CORS liberado no Back-End).
// O token JWT fica no localStorage e vai como Bearer em cada chamada.
// O HTML de linhas, toasts, alertas e estados fica em <template> nas views;
// aqui só clonamos e preenchemos com textContent.
(() => {
    const API = window.API_URL;
    const TOKEN_KEY = 'mash-token';
    const FLASH_KEY = 'mash-flash';

    const q = (selector, raiz = document) => raiz.querySelector(selector);
    const qa = (selector, raiz = document) => raiz.querySelectorAll(selector);
    const caminho = location.pathname;
    const paginaPublica =
        ['/login', '/signup'].includes(caminho) || caminho.startsWith('/forgot-password');
    const rota = (regex) => caminho.match(regex)?.[1];

    // ------------------------------------------------------------ storage

    const guardar = {
        get: (key) => {
            try {
                return localStorage.getItem(key);
            } catch {
                return null;
            }
        },
        set: (key, value) => {
            try {
                localStorage.setItem(key, value);
            } catch {
                /* sem storage */
            }
        },
        del: (key) => {
            try {
                localStorage.removeItem(key);
            } catch {
                /* sem storage */
            }
        },
    };

    // ------------------------------------------------------------ templates

    // Clona um <template> e preenche os [data-slot]: texto vira textContent; objeto vira atributos
    function clonar(id, dados = {}) {
        const fragmento = document.getElementById(id).content.cloneNode(true);
        const raiz = fragmento.firstElementChild;
        Object.entries(dados).forEach(([slot, valor]) => {
            const alvo = q(`[data-slot="${slot}"]`, raiz);
            if (!alvo) return;
            if (valor === null || valor === undefined || valor === false) return alvo.remove();
            if (typeof valor === 'object') {
                Object.entries(valor).forEach(([atributo, v]) => {
                    if (atributo === 'texto') alvo.textContent = v;
                    else alvo.setAttribute(atributo, v);
                });
            } else {
                alvo.textContent = valor;
            }
        });
        return raiz;
    }

    // ------------------------------------------------------------ datas

    const dataBR = (iso) => (iso ? new Date(iso).toLocaleDateString('pt-BR') : '—');
    const plural = (n, um, varios) => `${n} ${n === 1 ? um : varios}`;

    // ------------------------------------------------------------ mensagens

    const ALERTAS = {
        danger: { fundo: 'bg-perigo-suave', icone: ['ph-x-circle', 'text-perigo'], papel: 'alert' },
        warning: { fundo: 'bg-aviso-suave', icone: ['ph-warning', 'text-aviso'], papel: 'status' },
        info: { fundo: 'bg-info-suave', icone: ['ph-info', 'text-info'], papel: 'status' },
    };

    // Alerta que fica na tela até a próxima ação; acao = { texto, aoClicar }
    function mostrarAlerta(tipo, titulo, texto, acao) {
        const area = q('#mensagens');
        if (!area) return;

        const estilo = ALERTAS[tipo] ?? ALERTAS.danger;
        const alerta = clonar('tplAlerta', {
            titulo,
            texto: texto || null,
            acao: acao ? {} : null,
            acaoTexto: acao?.texto,
        });
        alerta.classList.add(estilo.fundo);
        alerta.setAttribute('role', estilo.papel);
        q('[data-slot="icone"]', alerta).classList.add(...estilo.icone);
        if (acao) q('[data-slot="acao"]', alerta).addEventListener('click', acao.aoClicar);
        area.replaceChildren(alerta);
        alerta.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }

    const limparAlerta = () => q('#mensagens')?.replaceChildren();

    // Confirmação passageira: some em 5 s, um por vez
    function mostrarToast(titulo, texto) {
        const area = q('#toasts');
        if (!area) return;

        const toast = clonar('tplToast', { titulo, texto: texto || null });
        q('[data-fechar]', toast).addEventListener('click', () => toast.remove());
        area.replaceChildren(toast);
        setTimeout(() => toast.remove(), 5000);
    }

    // Sucesso vira toast; erro e aviso ficam como alerta
    function mostrarMensagem(tipo, texto) {
        if (tipo === 'success') return mostrarToast(texto);
        mostrarAlerta(tipo, texto);
    }

    // Mensagem que precisa sobreviver a um redirecionamento (flash)
    function irPara(url, tipo, texto) {
        if (texto) guardar.set(FLASH_KEY, JSON.stringify({ tipo, texto }));
        location.href = url;
    }

    function mostrarFlash() {
        const salvo = guardar.get(FLASH_KEY);
        if (!salvo) return;

        guardar.del(FLASH_KEY);
        try {
            const { tipo, texto } = JSON.parse(salvo);
            mostrarMensagem(tipo, texto);
        } catch {
            /* flash inválido */
        }
    }

    // ------------------------------------------------------------ diálogo de confirmação

    // Substitui o confirm(): resolve true só no botão de confirmar
    // Com aoConfirmar, o diálogo fica aberto com o botão em "Excluindo…" até a API responder
    function confirmar({
        titulo,
        mensagem,
        botao = 'Excluir',
        carregandoTexto = 'Excluindo…',
        aoConfirmar,
    }) {
        const dialogo = q('#dialogoConfirmar');
        if (!dialogo) return Promise.resolve(false);

        q('#dialogoConfirmarTitulo').textContent = titulo;
        q('#dialogoConfirmarMensagem').textContent = mensagem;
        q('#dialogoConfirmarBotao').textContent = botao;
        let liberarFoco;

        return new Promise((resolve) => {
            const fechar = (resposta) => {
                dialogo.classList.replace('flex', 'hidden');
                dialogo.setAttribute('aria-hidden', 'true');
                document.removeEventListener('keydown', teclado);
                dialogo.removeEventListener('click', clique);
                liberarFoco();
                resolve(resposta);
            };
            let ocupado = false;
            const teclado = (event) => {
                if (event.key === 'Escape' && !ocupado) fechar(false);
            };
            const clique = async (event) => {
                if (ocupado) return;
                if (event.target === dialogo) return fechar(false);
                const escolha = event.target.closest('[data-confirmar]');
                if (!escolha) return;
                if (escolha.dataset.confirmar !== 'sim') return fechar(false);
                if (!aoConfirmar) return fechar(true);

                ocupado = true;
                const cancelar = q('[data-confirmar="nao"]', dialogo);
                cancelar.disabled = true;
                carregando(escolha, true, carregandoTexto);
                const resultado = await aoConfirmar();
                carregando(escolha, false);
                cancelar.disabled = false;
                fechar(resultado);
            };

            dialogo.classList.replace('hidden', 'flex');
            dialogo.setAttribute('aria-hidden', 'false');
            document.addEventListener('keydown', teclado);
            dialogo.addEventListener('click', clique);
            liberarFoco = prenderFoco(dialogo);
            q('[data-confirmar="nao"]', dialogo).focus();
        });
    }

    // ------------------------------------------------------------ formulários

    // Erro embaixo do campo: [data-campo=nome] ganha .campo-erro e o texto vai para [data-erro]
    function erroCampo(form, nome, texto) {
        const campo = q(`[data-campo="${nome}"]`, form);
        if (!campo) return;

        const ajuda = q('[data-erro]', campo);
        if (ajuda && ajuda.dataset.ajuda === undefined) ajuda.dataset.ajuda = ajuda.textContent;
        if (ajuda) ajuda.textContent = texto;
        campo.classList.add('campo-erro');
        q('input, select', campo)?.setAttribute('aria-invalid', 'true');
    }

    function limparErros(raiz) {
        qa('.campo-erro', raiz).forEach((campo) => {
            campo.classList.remove('campo-erro');
            const ajuda = q('[data-erro]', campo);
            if (ajuda) ajuda.textContent = ajuda.dataset.ajuda ?? '';
            q('input, select', campo)?.removeAttribute('aria-invalid');
        });
    }

    const focarPrimeiroErro = (form) => q('.campo-erro input, .campo-erro select', form)?.focus();

    // Botão em carregamento: desativado, ícone girando e texto no gerúndio
    const conteudoOriginal = new WeakMap();
    function carregando(botao, ativo, texto = 'Salvando…') {
        if (!botao) return;
        if (ativo) {
            conteudoOriginal.set(botao, [...botao.childNodes]);
            botao.disabled = true;
            const icone = document.createElement('i');
            icone.className = 'ph ph-circle-notch animate-spin';
            icone.setAttribute('aria-hidden', 'true');
            botao.replaceChildren(icone, texto);
        } else if (conteudoOriginal.has(botao)) {
            botao.disabled = false;
            botao.replaceChildren(...conteudoOriginal.get(botao));
            conteudoOriginal.delete(botao);
        }
    }

    const formData = (form) => Object.fromEntries(new FormData(form));
    const botaoEnviar = (form) => q('button[type="submit"]', form);

    function fecharModal(id) {
        const modal = document.getElementById(id);
        if (!modal) return;
        closeModal(modal);
    }

    const abrirModal = (id) => q(`[data-modal-open="${id}"]`)?.click();

    // ------------------------------------------------------------ estados de lista

    function listaCarregando(lista, linhas = 3) {
        lista.replaceChildren(...Array.from({ length: linhas }, () => clonar('tplCarregando')));
        lista.setAttribute('aria-busy', 'true');
    }

    // Vazio ou erro dentro do card da lista; acao = { texto, icone, href? ou aoClicar? }
    function listaEstado(lista, { icone, erro = false, titulo, texto, acao }) {
        const estado = clonar('tplEstado', {
            titulo,
            texto: texto || null,
            acao: acao ? {} : null,
            acaoLink: acao?.href ? { href: acao.href } : null,
            acaoBotao: acao && !acao.href ? {} : null,
        });
        q('[data-slot="icone"]', estado).classList.add(icone);
        if (erro)
            q('[data-slot="marcador"]', estado).classList.replace('text-texto-2', 'text-perigo');
        if (acao) {
            const botao = q('[data-slot="acaoLink"], [data-slot="acaoBotao"]', estado);
            q('i', botao).classList.add(acao.icone);
            q('span', botao).textContent = acao.texto;
            if (erro) botao.classList.replace('btn-primario', 'btn-secundario');
            if (acao.aoClicar) botao.addEventListener('click', acao.aoClicar);
        }
        lista.removeAttribute('aria-busy');
        lista.replaceChildren(estado);
    }

    function listaErro(lista, titulo, data, recarregar) {
        listaEstado(lista, {
            icone: 'ph-cloud-slash',
            erro: true,
            titulo,
            texto: mensagemDaApi(data, 'Tente de novo em alguns segundos.'),
            acao: { texto: 'Tentar de novo', icone: 'ph-arrow-clockwise', aoClicar: recarregar },
        });
    }

    // ------------------------------------------------------------ API

    const mensagemDaApi = (data, padrao) => data?.error ?? data?.message ?? padrao;

    // Nunca lança: devolve { status, data }
    async function api(metodo, caminhoApi, corpo) {
        const token = guardar.get(TOKEN_KEY);

        try {
            // FormData (upload de foto): o navegador define o Content-Type com o boundary
            const multipart = corpo instanceof FormData;
            const signal = AbortSignal.timeout(15000);
            const resposta = await fetch(API + caminhoApi, {
                method: metodo,
                signal,
                headers: {
                    ...(!multipart && { 'Content-Type': 'application/json' }),
                    ...(token && { Authorization: `Bearer ${token}` }),
                },
                ...(corpo && { body: multipart ? corpo : JSON.stringify(corpo) }),
            });
            const data = await resposta.json().catch(() => {
                signal.throwIfAborted();
                return {};
            });

            // Token ausente, inválido ou expirado: volta ao login
            if (resposta.status === 401 && token && guardar.get(TOKEN_KEY) === token) {
                guardar.del(TOKEN_KEY);
                irPara(
                    '/login',
                    'warning',
                    mensagemDaApi(data, 'Sessão expirada. Entre novamente.')
                );
            }

            return { status: resposta.status, data };
        } catch (erro) {
            return {
                status: 503,
                data: {
                    error:
                        erro.name === 'TimeoutError'
                            ? metodo === 'GET'
                                ? 'O servidor demorou para responder. Tente novamente.'
                                : 'O servidor demorou para responder. A alteração pode ter sido salva; confira os dados antes de tentar novamente.'
                            : 'Não foi possível conectar ao servidor',
                },
            };
        }
    }

    function sair(texto) {
        guardar.del(TOKEN_KEY);
        irPara('/login', 'success', texto);
    }

    // ------------------------------------------------------------ guarda de rota

    if (!paginaPublica && !guardar.get(TOKEN_KEY)) {
        location.replace('/login');
        return;
    }
    if (paginaPublica && guardar.get(TOKEN_KEY)) {
        location.replace('/dashboard');
        return;
    }

    mostrarFlash();

    // Atualiza o título da aba e o último item da trilha do header
    function nomearPagina(nome) {
        const atual = q('[data-trilha-atual]');
        if (atual) atual.textContent = nome;
        document.title = `${nome} · MASH`;
    }

    // ------------------------------------------------------------ login e cadastro

    q('#formLogin')?.addEventListener('submit', async (event) => {
        event.preventDefault();
        const form = event.target;
        const { email, password } = formData(form);
        limparAlerta();

        if (!email.trim() || !password) {
            return mostrarAlerta('danger', 'E-mail e senha não podem estar vazios');
        }

        carregando(botaoEnviar(form), true, 'Entrando…');
        const { status, data } = await api('POST', '/login', { email: email.trim(), password });
        carregando(botaoEnviar(form), false);

        if (status !== 200 || !data.token) {
            return mostrarAlerta('danger', mensagemDaApi(data, 'Não foi possível entrar'));
        }

        guardar.set(TOKEN_KEY, data.token);
        location.href = '/dashboard';
    });

    q('#formCadastro')?.addEventListener('submit', async (event) => {
        event.preventDefault();
        const form = event.target;
        const { name, email, password, confirmarSenha } = formData(form);
        limparErros(form);
        limparAlerta();

        if (password !== confirmarSenha) {
            erroCampo(form, 'confirmarSenha', 'As senhas não conferem');
            return focarPrimeiroErro(form);
        }

        carregando(botaoEnviar(form), true, 'Criando conta…');
        const { status, data } = await api('POST', '/user', { name, email, password });
        carregando(botaoEnviar(form), false);

        if (status !== 201) {
            return mostrarAlerta('danger', mensagemDaApi(data, 'Não foi possível cadastrar'));
        }

        irPara('/login', 'success', mensagemDaApi(data, 'Usuário criado com sucesso'));
    });

    qa('a[href="/logout"]').forEach((link) => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            sair();
        });
    });

    // ------------------------------------------------------------ usuário (telas logadas)

    let usuario = null;

    function preencherPerfil() {
        const perfil = q('#formPerfil');
        if (!perfil || !usuario) return;
        perfil.elements.name.value = usuario.name ?? '';
        perfil.elements.email.value = usuario.email ?? '';
        perfil.elements.phone.value = usuario.phone ?? '';
        perfil.elements.password.value = '';
        perfil.elements.confirmarSenha.value = '';
        limparErros(perfil);
    }

    async function carregarUsuario() {
        const salvar = q('#btnSalvar');
        if (salvar) {
            salvar.disabled = true;
            limparAlerta();
        }
        const { status, data } = await api('GET', '/user');
        if (status !== 200 || !data.user) {
            if (q('#formPerfil'))
                mostrarAlerta(
                    'danger',
                    mensagemDaApi(data, 'Não foi possível carregar o perfil'),
                    'Carregue seus dados antes de salvar alterações.',
                    { texto: 'Tentar de novo', aoClicar: carregarUsuario }
                );
            return;
        }

        usuario = data.user;
        qa('[data-user="name"]').forEach((el) => {
            el.textContent = usuario.name ?? '';
        });
        qa('[data-user="email"]').forEach((el) => {
            el.textContent = usuario.email ?? '';
        });
        qa('[data-user="urlImage"]').forEach((el) => {
            if (usuario.urlImage) el.src = usuario.urlImage;
        });
        qa('[data-user="createdAt"]').forEach((el) => {
            if (usuario.createdAt) el.textContent = dataBR(usuario.createdAt);
        });
        preencherPerfil();
        if (salvar) salvar.disabled = false;
    }

    if (!paginaPublica) carregarUsuario();

    q('#btnDescartar')?.addEventListener('click', preencherPerfil);

    // Últimos acessos: a rota chega com conloq/mash#102; até lá o 404 vira lista vazia
    async function carregarAcessos() {
        const lista = q('#listaAcessos');
        if (!lista) return;

        listaCarregando(lista, 2);
        const { status, data } = await api('GET', '/user/login-history');
        if (status !== 200 && status !== 404)
            return listaErro(lista, 'Não foi possível carregar os acessos', data, carregarAcessos);

        // shortcut: formato da resposta ainda não publicado no Swagger; ajustar quando a #102 sair
        const acessos = status === 404 ? [] : (data.loginHistory ?? []);
        if (!acessos.length)
            return listaEstado(lista, {
                icone: 'ph-clock-counter-clockwise',
                titulo: 'Nenhum acesso registrado',
            });

        lista.removeAttribute('aria-busy');
        lista.replaceChildren(
            ...acessos.map((acesso) => {
                const linha = clonar('tplLinhaAcesso', {
                    local: acesso.location,
                    quando: `${new Date(acesso.loggedAt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })} · ${acesso.ipAddress}`,
                    // status = IP já visto nesta conta (não é sucesso/falha do login)
                    status:
                        acesso.status === null || acesso.status === undefined
                            ? null
                            : acesso.status
                              ? 'Dispositivo conhecido'
                              : 'Novo dispositivo',
                });
                q('[data-slot="status"]', linha)?.classList.add(
                    acesso.status ? 'selo-sucesso' : 'selo-aviso'
                );
                return linha;
            })
        );
    }

    carregarAcessos();

    const volume = q('#volume');
    volume?.addEventListener('input', () =>
        volume.setAttribute('aria-valuetext', ['Baixo', 'Médio', 'Alto'][volume.value])
    );

    q('#formPerfil')?.addEventListener('submit', async (event) => {
        event.preventDefault();
        const form = event.target;
        if (q('#btnSalvar')?.disabled || !usuario) return;
        const { name, email, phone, password, confirmarSenha } = formData(form);
        limparErros(form);
        limparAlerta();

        if (!name.trim()) erroCampo(form, 'name', 'Informe seu nome.');
        if (!email.trim()) erroCampo(form, 'email', 'Informe seu e-mail.');
        if (password && /\s/.test(password))
            erroCampo(form, 'password', 'A senha não pode conter espaços');
        if (password && password !== confirmarSenha)
            erroCampo(form, 'confirmarSenha', 'As senhas não conferem');
        if (q('.campo-erro', form)) return focarPrimeiroErro(form);

        carregando(botaoEnviar(form), true);
        const { status, data } = await api('PUT', '/user', {
            name,
            email,
            phone,
            ...(password && { password }),
        });
        carregando(botaoEnviar(form), false);

        if (status !== 200) {
            return mostrarAlerta('danger', mensagemDaApi(data, 'Não foi possível salvar'));
        }

        mostrarToast(mensagemDaApi(data, 'Usuário atualizado com sucesso'));
        carregarUsuario();
    });

    q('#formFoto')?.addEventListener('submit', async (event) => {
        event.preventDefault();
        const form = event.target;
        const arquivo = q('#inputFoto')?.files[0];
        limparAlerta();
        if (!arquivo)
            return mostrarAlerta(
                'danger',
                'Nenhuma imagem foi enviada',
                'Escolha uma foto JPEG ou PNG.'
            );

        const corpo = new FormData();
        corpo.append('image', arquivo);

        carregando(botaoEnviar(form), true, 'Enviando…');
        const { status, data } = await api('PUT', '/user/upload', corpo);
        carregando(botaoEnviar(form), false);

        if (status !== 200) {
            return mostrarAlerta('danger', mensagemDaApi(data, 'Não foi possível enviar a foto'));
        }

        mostrarToast(mensagemDaApi(data, 'Imagem enviada com sucesso'));
        if (data.url)
            qa('[data-user="urlImage"]').forEach((el) => {
                el.src = data.url;
            });
    });

    q('#btnExcluir')?.addEventListener('click', async () => {
        const excluida = await confirmar({
            titulo: 'Excluir sua conta?',
            mensagem: 'Você sai do MASH e perde o acesso às suas receitas. Não dá para desfazer.',
            botao: 'Excluir conta',
            aoConfirmar: async () => {
                const { status, data } = await api('DELETE', '/user');
                if (status === 204) return true;
                mostrarAlerta('danger', mensagemDaApi(data, 'Não foi possível excluir a conta'));
                return false;
            },
        });
        if (excluida) sair('Conta excluída');
    });

    // ------------------------------------------------------------ receitas

    let receitasCarregadas = [];

    // Faixa das rampas de uma receita: menor mínima até a maior máxima
    function faixaDasRampas(rampas) {
        if (!rampas?.length) return null;
        const min = Math.min(...rampas.map((t) => t.minTemperatureRamp));
        const max = Math.max(...rampas.map((t) => t.maxTemperatureRamp));
        return `${min} – ${max} ºC`;
    }

    function linhaReceita({ receita, rampas }) {
        const faixa = faixaDasRampas(rampas);
        const linha = clonar('tplLinhaReceita', {
            nome: { href: `/recipes/${receita.id}`, texto: receita.name },
            rampas: rampas
                ? rampas.length
                    ? plural(rampas.length, 'rampa', 'rampas')
                    : 'Nenhuma'
                : '—',
            faixa: rampas === null ? 'Não foi possível carregar' : (faixa ?? 'Sem rampas'),
            criadaEm: dataBR(receita.createdAt),
            novaRampa: {
                href: `/recipes/${receita.id}/temperatures/new`,
                'aria-label': `Adicionar rampa em ${receita.name}`,
            },
            renomear: {
                href: `/recipes/${receita.id}/edit`,
                'aria-label': `Editar ${receita.name}`,
            },
            excluir: { 'aria-label': `Excluir ${receita.name}` },
        });
        if (!faixa) {
            q('[data-slot="faixa"]', linha).classList.remove('md:font-medium', 'md:text-texto');
            // no mobile fica só "Sem rampas", sem o "Nenhuma ·" antes
            ['rampas', 'separador'].forEach((slot) =>
                q(`[data-slot="${slot}"]`, linha).classList.add('max-md:hidden')
            );
        }
        q('[data-slot="excluir"]', linha).addEventListener('click', async () => {
            if (!(await excluirReceita(receita))) return;
            mostrarToast('Receita excluída');
            carregarReceitas();
        });
        return linha;
    }

    function desenharReceitas() {
        const lista = q('#listaReceitas');
        const termo = (q('#buscaReceitas')?.value ?? '').trim().toLowerCase();
        const visiveis = receitasCarregadas.filter(({ receita }) =>
            receita.name.toLowerCase().includes(termo)
        );
        q('#contagemReceitas').textContent = plural(
            receitasCarregadas.length,
            'receita',
            'receitas'
        );

        if (!receitasCarregadas.length) {
            return listaEstado(lista, {
                icone: 'ph-scroll',
                titulo: 'Nenhuma receita cadastrada',
                texto: 'Crie uma receita e adicione as rampas de temperatura para usá-la nos seus lotes.',
                acao: {
                    texto: 'Criar primeira receita',
                    icone: 'ph-plus',
                    aoClicar: () => abrirModal('modalReceita'),
                },
            });
        }
        if (!visiveis.length) {
            return listaEstado(lista, {
                icone: 'ph-magnifying-glass',
                titulo: 'Nenhuma receita encontrada',
                texto: 'Tente outro nome.',
            });
        }
        lista.removeAttribute('aria-busy');
        lista.replaceChildren(...visiveis.map(linhaReceita));
    }

    async function carregarReceitas() {
        const lista = q('#listaReceitas');
        if (!lista) return;

        listaCarregando(lista);
        const { status, data } = await api('GET', '/recipes');
        if (status !== 200) {
            mostrarAlerta('danger', mensagemDaApi(data, 'Não foi possível carregar as receitas'));
            return listaErro(
                lista,
                'Não foi possível carregar as receitas',
                data,
                carregarReceitas
            );
        }

        const receitas = data.recipes ?? [];
        const rampas = await Promise.all(
            receitas.map((r) => api('GET', `/recipes/${r.id}/temperatures`))
        );
        receitasCarregadas = receitas.map((receita, i) => ({
            receita,
            rampas: rampas[i].status === 200 ? (rampas[i].data.temperatures ?? []) : null,
        }));
        desenharReceitas();
    }

    async function excluirReceita(receita) {
        return confirmar({
            titulo: `Excluir a receita ${receita.name}?`,
            mensagem:
                'As rampas de temperatura desta receita também serão excluídas. Não dá para desfazer.',
            botao: 'Excluir receita',
            aoConfirmar: async () => {
                const { status, data } = await api('DELETE', `/recipes/${receita.id}`);
                if (status === 204) return true;
                mostrarAlerta('danger', mensagemDaApi(data, 'Não foi possível excluir a receita'));
                return false;
            },
        });
    }

    q('#buscaReceitas')?.addEventListener('input', desenharReceitas);

    q('#formReceita')?.addEventListener('submit', async (event) => {
        event.preventDefault();
        const form = event.target;
        const name = formData(form).name.trim();
        limparErros(form);

        if (!name) {
            erroCampo(form, 'name', 'Nome não pode estar vazio');
            return focarPrimeiroErro(form);
        }

        carregando(botaoEnviar(form), true, 'Criando…');
        const { status, data } = await api('POST', '/recipes', { name });
        carregando(botaoEnviar(form), false);

        if (status !== 201) {
            erroCampo(form, 'name', mensagemDaApi(data, 'Não foi possível criar a receita'));
            return focarPrimeiroErro(form);
        }

        form.reset();
        fecharModal('modalReceita');
        mostrarToast(mensagemDaApi(data, 'Receita criada com sucesso'), data.recipe?.name);
        carregarReceitas();
    });

    carregarReceitas();

    // ------------------------------------------------------------ novo lote: receitas reais no seletor

    async function carregarReceitasDoLote() {
        const seletor = q('#loteReceita');
        if (!seletor) return;
        const { status, data } = await api('GET', '/recipes');
        if (status !== 200) {
            seletor.options[0].textContent = 'Não foi possível carregar as receitas';
            return erroCampo(
                q('#formLote'),
                'recipeId',
                mensagemDaApi(data, 'Tente de novo em alguns segundos.')
            );
        }
        const receitas = data.recipes ?? [];
        seletor.options[0].textContent = receitas.length
            ? 'Escolha a receita'
            : 'Nenhuma receita cadastrada';
        receitas.forEach((r) => seletor.add(new Option(r.name, r.id)));
    }

    carregarReceitasDoLote();

    // ------------------------------------------------------------ detalhe da receita

    const receitaId = rota(/^\/recipes\/([1-9][0-9]*)(?:\/edit)?$/);

    function linhaRampa(t, i) {
        const ordem = String(t.orderRamp ?? i + 1);
        const linha = clonar('tplLinhaRampa', {
            ordem,
            faixa: `${t.minTemperatureRamp} – ${t.maxTemperatureRamp} ºC`,
            limites: `${t.minTemperatureLimit} – ${t.maxTemperatureLimit} ºC`,
            timer: t.timer,
            inicio: t.initialization,
            ideal: t.idealTime,
            editar: {
                href: `/recipes/${receitaId}/temperatures/${t.id}/edit`,
                'aria-label': `Editar rampa ${ordem}`,
            },
            excluir: { 'aria-label': `Excluir rampa ${ordem}` },
        });
        // Excluir rampa ainda não tem rota na API (conloq/mash#97): avisa em vez de apagar
        q('[data-sem-api]', linha).addEventListener('click', avisarSemApi);
        return linha;
    }

    // "HH:MM:SS" em minutos; NaN quando o formato não bate
    const minutos = (hms) => {
        const [h, m, seg] = String(hms ?? '')
            .split(':')
            .map(Number);
        return h * 60 + m + seg / 60;
    };

    // Perfil das rampas: cada faixa ocupa do início do timer até o fim, na altura da temperatura
    function desenharPerfil(rampas) {
        const perfil = q('#perfilRampas');
        if (!perfil) return;
        const faixas = (rampas ?? [])
            .map((t, i) => ({ t, i, ini: minutos(t.initialization), dur: minutos(t.timer) }))
            .filter((f) => Number.isFinite(f.ini) && f.dur > 0);
        perfil.classList.toggle('hidden', !faixas.length);
        perfil.classList.toggle('flex', faixas.length > 0);
        if (!faixas.length) return;

        const total = Math.max(...faixas.map((f) => f.ini + f.dur));
        const piso =
            Math.floor((Math.min(...faixas.map((f) => f.t.minTemperatureLimit)) - 2) / 5) * 5;
        // folga em cima para o rótulo da rampa mais quente
        const teto =
            Math.ceil((Math.max(...faixas.map((f) => f.t.maxTemperatureLimit)) + 8) / 5) * 5;
        const pct = (v) => `${v * 100}%`;
        const grafico = q('#perfilGrafico');

        grafico.replaceChildren(
            ...faixas.map(({ t, i, ini, dur }) => {
                const ordem = t.orderRamp ?? i + 1;
                const limite = Math.max(t.maxTemperatureLimit - t.minTemperatureLimit, 1);
                const caixa = clonar('tplFaixaRampa', {
                    nome: `Rampa ${ordem}`,
                    detalhe: `${t.minTemperatureRamp} – ${t.maxTemperatureRamp} ºC · ${Math.round(dur)} min`,
                });
                Object.assign(caixa.style, {
                    left: pct(ini / total),
                    width: pct(dur / total),
                    top: pct((teto - t.maxTemperatureLimit) / (teto - piso)),
                    height: pct(limite / (teto - piso)),
                });
                Object.assign(q('[data-slot="faixa"]', caixa).style, {
                    top: pct((t.maxTemperatureLimit - t.maxTemperatureRamp) / limite),
                    height: pct((t.maxTemperatureRamp - t.minTemperatureRamp) / limite),
                });
                // rótulo alinhado à direita nas rampas do fim, para não sair do gráfico
                q('[data-slot="rotulo"]', caixa).classList.add(
                    ini / total > 0.6 ? 'right-0' : 'left-1'
                );
                return caixa;
            })
        );
        grafico.setAttribute(
            'aria-label',
            `${plural(faixas.length, 'rampa', 'rampas')} entre ${piso} e ${teto} ºC em ${Math.round(total)} minutos. Os valores estão na tabela acima.`
        );
        q('[data-perfil="piso"]').textContent = `${piso} ºC`;
        q('[data-perfil="teto"]').textContent = `${teto} ºC`;
        q('[data-perfil="total"]').textContent = `${Math.round(total)} min`;
    }

    async function carregarRampasDaReceita() {
        const lista = q('#detalheRampas');
        listaCarregando(lista, 2);
        const { status, data } = await api('GET', `/recipes/${receitaId}/temperatures`);
        if (status !== 200) {
            listaErro(lista, 'Não foi possível carregar as rampas', data, carregarRampasDaReceita);
            desenharPerfil(null);
            return null;
        }

        const rampas = data.temperatures ?? [];
        if (!rampas.length) {
            listaEstado(lista, {
                icone: 'ph-thermometer-simple',
                titulo: 'Nenhuma rampa ainda',
                texto: 'Adicione a primeira rampa de temperatura desta receita.',
                acao: {
                    texto: 'Adicionar rampa',
                    icone: 'ph-plus',
                    href: `/recipes/${receitaId}/temperatures/new`,
                },
            });
        } else {
            lista.removeAttribute('aria-busy');
            lista.replaceChildren(...rampas.map(linhaRampa));
        }
        desenharPerfil(rampas);
        return rampas;
    }

    async function carregarDetalhe() {
        const form = q('#formEditarReceita');
        if (!form || !receitaId) return;

        q('#newTemperatureLink').href = `/recipes/${receitaId}/temperatures/new`;
        q('#newTemperatureLinkMobile').href = `/recipes/${receitaId}/temperatures/new`;
        q('#iodoReceitaLink').href = `/recipes/${receitaId}/iodine`;
        const { status, data } = await api('GET', `/recipes/${receitaId}`);
        if (status !== 200) {
            q('#recipeResumo').textContent = '';
            return mostrarAlerta(
                'danger',
                mensagemDaApi(data, 'Não foi possível carregar a receita')
            );
        }

        const receita = data.recipe;
        q('#recipeName').textContent = receita.name;
        nomearPagina(receita.name);
        form.elements.name.value = receita.name;

        const rampas = await carregarRampasDaReceita();
        q('#recipeResumo').textContent = [
            rampas
                ? rampas.length
                    ? plural(rampas.length, 'rampa', 'rampas')
                    : 'nenhuma rampa'
                : null,
            `criada em ${dataBR(receita.createdAt)}`,
        ]
            .filter(Boolean)
            .join(' · ');

        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            const name = form.elements.name.value.trim();
            limparErros(form);
            if (!name) {
                erroCampo(form, 'name', 'Nome não pode estar vazio');
                return focarPrimeiroErro(form);
            }

            carregando(botaoEnviar(form), true);
            const resposta = await api('PUT', `/recipes/${receitaId}`, { name });
            carregando(botaoEnviar(form), false);
            if (resposta.status !== 200) {
                erroCampo(
                    form,
                    'name',
                    mensagemDaApi(resposta.data, 'Não foi possível salvar a receita')
                );
                return focarPrimeiroErro(form);
            }

            receita.name = name;
            q('#recipeName').textContent = name;
            nomearPagina(name);
            fecharModal('modalRenomear');
            history.replaceState(null, '', `/recipes/${receitaId}`);
            mostrarToast(mensagemDaApi(resposta.data, 'Receita atualizada com sucesso'));
        });

        q('#btnExcluirReceita').addEventListener('click', async () => {
            if (await excluirReceita(receita)) irPara('/recipes', 'success', 'Receita excluída');
        });
    }

    carregarDetalhe();

    // ------------------------------------------------------------ nova rampa de temperatura

    const TEMPERATURAS = [
        'minTemperatureRamp',
        'maxTemperatureRamp',
        'minTemperatureLimit',
        'maxTemperatureLimit',
    ];
    const HORARIOS = ['timer', 'initialization', 'idealTime'];
    const HORARIO_VALIDO = /^([01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/;
    const comSegundos = (valor) => (/^\d{2}:\d{2}$/.test(valor ?? '') ? `${valor}:00` : valor);

    // Valida como a API (inteiro de 0 a 100, mínima ≤ máxima, HH:MM:SS) e marca cada campo
    function validarRampa(form, campos) {
        TEMPERATURAS.forEach((key) => {
            const n = Number(campos[key]);
            if (campos[key] === '' || !Number.isInteger(n) || n < 0 || n > 100)
                erroCampo(form, key, 'Use um número inteiro de 0 a 100 ºC.');
        });
        const valido = (key) => !q(`[data-campo="${key}"].campo-erro`, form);
        if (
            valido('minTemperatureRamp') &&
            valido('maxTemperatureRamp') &&
            Number(campos.minTemperatureRamp) > Number(campos.maxTemperatureRamp)
        ) {
            erroCampo(
                form,
                'maxTemperatureRamp',
                `Precisa ser igual ou maior que a mínima (${campos.minTemperatureRamp} ºC).`
            );
        }
        if (
            valido('minTemperatureLimit') &&
            valido('maxTemperatureLimit') &&
            Number(campos.minTemperatureLimit) > Number(campos.maxTemperatureLimit)
        ) {
            erroCampo(
                form,
                'maxTemperatureLimit',
                `Precisa ser igual ou maior que o limite mínimo (${campos.minTemperatureLimit} ºC).`
            );
        }
        HORARIOS.forEach((key) => {
            if (!HORARIO_VALIDO.test(comSegundos(campos[key]) ?? ''))
                erroCampo(form, key, 'Use hora, minuto e segundo: 00:40:00.');
        });
        if (campos.orderRamp !== '' && !Number.isInteger(Number(campos.orderRamp)))
            erroCampo(form, 'orderRamp', 'Ordem da rampa deve ser um inteiro válido');
        return !q('.campo-erro', form);
    }

    function iniciarFormRampa() {
        const form = q('#formTemperatura');
        if (!form) return;

        const [, idReceita, idRampa] =
            caminho.match(
                /^\/recipes\/([1-9][0-9]*)\/temperatures\/(?:new|([1-9][0-9]*)\/edit)$/
            ) ?? [];
        const urlReceita = `/recipes/${idReceita}`;
        q('#voltarReceita').href = urlReceita;
        q('#voltarTopo').href = urlReceita;
        q('#cancelarRampa').href = urlReceita;
        api('GET', urlReceita).then(({ status, data }) => {
            if (status === 200) q('#voltarReceita span').textContent = data.recipe.name;
        });

        // Edição: preenche com a rampa salva; o envio fica com o aviso data-sem-api (conloq/mash#97)
        if (idRampa) return preencherRampa(form, idReceita, idRampa);

        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            const campos = formData(form);
            limparErros(form);
            limparAlerta();

            if (!validarRampa(form, campos)) {
                mostrarAlerta('danger', 'Confira os campos marcados', 'Corrija e salve de novo.');
                return focarPrimeiroErro(form);
            }

            carregando(botaoEnviar(form), true);
            const { status, data } = await api('POST', `/recipes/${idReceita}/temperatures`, {
                ...Object.fromEntries(TEMPERATURAS.map((key) => [key, Number(campos[key])])),
                ...Object.fromEntries(HORARIOS.map((key) => [key, comSegundos(campos[key])])),
                ...(campos.orderRamp !== '' && { orderRamp: Number(campos.orderRamp) }),
            });
            carregando(botaoEnviar(form), false);

            if (status !== 201) {
                return mostrarAlerta(
                    'danger',
                    mensagemDaApi(data, 'Não foi possível salvar a temperatura')
                );
            }

            irPara(urlReceita, 'success', mensagemDaApi(data, 'Temperatura criada com sucesso'));
        });
    }

    async function preencherRampa(form, idReceita, idRampa) {
        const { status, data } = await api('GET', `/recipes/${idReceita}/temperatures`);
        const rampa =
            status === 200 && (data.temperatures ?? []).find((t) => String(t.id) === idRampa);
        if (!rampa) {
            return mostrarAlerta(
                'danger',
                status === 200
                    ? 'Rampa não encontrada nesta receita'
                    : mensagemDaApi(data, 'Não foi possível carregar a rampa')
            );
        }
        [...TEMPERATURAS, ...HORARIOS, 'orderRamp'].forEach((key) => {
            form.elements[key].value = rampa[key] ?? '';
        });
    }

    iniciarFormRampa();

    // ------------------------------------------------------------ teste de iodo da receita

    const receitaIodo = rota(/^\/recipes\/([1-9][0-9]*)\/iodine$/);

    // Prévia: capturas a partir da primeira coleta, no intervalo, até o máximo; a faixa é a duração da rampa
    function desenharPrevia(form, rampas) {
        const primeira = Number(form.elements.primeiraColeta.value);
        const intervalo = Number(form.elements.intervalo.value);
        const maximo = Number(form.elements.maximoColetas.value);
        const rampa = rampas.find((t) => String(t.id) === form.elements.rampa.value);
        const capturas = q('#previaCapturas');
        const faixa = q('#previaRampa');

        const valido =
            primeira >= 0 &&
            intervalo > 0 &&
            Number.isInteger(maximo) &&
            maximo >= 1 &&
            maximo <= 20;
        if (!valido) {
            capturas.replaceChildren();
            faixa.style.width = '0';
            q('#previaResumo').textContent =
                'Preencha a primeira coleta, o intervalo e o máximo para ver a prévia.';
            return;
        }

        const minutosCaptura = Array.from({ length: maximo }, (_, i) => primeira + i * intervalo);
        const duracao = rampa ? minutos(rampa.timer) : 0;
        const total = Math.max(duracao || 0, minutosCaptura.at(-1)) + intervalo;
        // 4% de folga nas pontas para o número da captura não cortar
        const pos = (m) => `${4 + (92 * m) / total}%`;

        faixa.style.width = duracao > 0 ? pos(duracao) : '0';
        capturas.replaceChildren(
            ...minutosCaptura.map((m, i) => {
                const marcador = clonar('tplCapturaPrevia', {
                    numero: String(i + 1),
                    minuto: `${m} min`,
                });
                marcador.style.left = pos(m);
                return marcador;
            })
        );
        const nomeRampa = rampa
            ? `da rampa ${rampa.orderRamp ?? rampas.indexOf(rampa) + 1}`
            : 'da rampa';
        q('#previaResumo').textContent =
            `${plural(maximo, 'captura', 'capturas')} a partir de ${primeira} min ${nomeRampa}, a cada ${intervalo} min` +
            (duracao > 0 ? `; a rampa tem ${Math.round(duracao)} min programados.` : '.');
    }

    async function iniciarTesteIodoReceita() {
        const form = q('#formIodoReceita');
        if (!form || !receitaIodo) return;

        const seletor = form.elements.rampa;
        const { status, data } = await api('GET', `/recipes/${receitaIodo}/temperatures`);
        const rampas = status === 200 ? (data.temperatures ?? []) : [];
        if (status !== 200)
            erroCampo(form, 'rampa', mensagemDaApi(data, 'Não foi possível carregar as rampas'));
        seletor.options[0].textContent = rampas.length
            ? 'Escolha a rampa'
            : 'Nenhuma rampa nesta receita';
        rampas.forEach((t, i) =>
            seletor.add(
                new Option(
                    `Rampa ${t.orderRamp ?? i + 1} · ${t.minTemperatureRamp} – ${t.maxTemperatureRamp} ºC`,
                    t.id
                )
            )
        );
        // sugere a sacarificação: a rampa cuja faixa inclui 65 ºC
        const sacarificacao = rampas.find(
            (t) => t.minTemperatureRamp <= 65 && 65 <= t.maxTemperatureRamp
        );
        if (sacarificacao) seletor.value = String(sacarificacao.id);

        form.addEventListener('input', () => desenharPrevia(form, rampas));
        desenharPrevia(form, rampas);
    }

    iniciarTesteIodoReceita();

    // ------------------------------------------------------------ ações ainda indisponíveis

    // shortcut: ação sem rota na API só não envia nada e não mostra aviso (decisão de 22/10/2026); trocar pela chamada real quando a issue de data-sem-api sair
    function avisarSemApi(event) {
        event.preventDefault();
    }

    qa('form[data-sem-api]').forEach((form) => form.addEventListener('submit', avisarSemApi));
    qa('button[data-sem-api]').forEach((botao) => botao.addEventListener('click', avisarSemApi));

    // Simulação do teste de iodo, sem etiqueta na tela por decisão de 21/10/2026 (conloq/mash#9); a leitura real virá do serviço Python + OpenCV (#34)
    const COLETAS_DEMO = [
        {
            hora: '14:25',
            resultado: 'Amido presente',
            cor: '#2b1a3d',
            posicao: 6,
            detalhe: 'Coleta 1 · 66 ºC',
            descricao: 'Ainda há amido no mosto. A mosturação continua.',
        },
        {
            hora: '14:35',
            resultado: 'Conversão parcial',
            cor: '#7a2f3a',
            posicao: 32,
            detalhe: 'Coleta 2 · 66 ºC',
            descricao: 'A conversão avançou, mas ainda reage ao iodo.',
        },
        {
            hora: '14:45',
            resultado: 'Conversão parcial',
            cor: '#9c3d1e',
            posicao: 58,
            detalhe: 'Coleta 3 · 67 ºC',
            descricao: 'Quase lá. Próxima coleta em 10 minutos.',
        },
        {
            hora: '14:55',
            resultado: 'Sem amido detectável',
            cor: '#e9b949',
            posicao: 94,
            detalhe: 'Coleta 4 · 67 ºC',
            descricao: 'A amostra ficou amarela: não há amido detectável.',
        },
    ];

    if (q('#demoColetas')) {
        const passo = matchMedia('(prefers-reduced-motion: reduce)').matches ? 1200 : 2200;
        let timers = [];

        const mostrarLendo = (sim) => {
            q('#demoLendo').classList.toggle('hidden', !sim);
            q('#demoLendo').classList.toggle('flex', sim);
        };

        function reiniciarDemo() {
            timers.forEach(clearTimeout);
            timers = [];
            q('#demoColetas').replaceChildren(
                Object.assign(document.createElement('li'), {
                    id: 'demoSemColetas',
                    className: 'py-6 text-center text-sm text-texto-2',
                    textContent: 'As coletas aparecem aqui.',
                })
            );
            q('#demoAmostra').style.background = '#b9b0a8';
            q('#demoResultado').textContent = 'Nenhuma coleta ainda';
            q('#demoDescricao').textContent = 'Inicie o teste para ver as coletas acontecendo.';
            q('#demoMarcador').classList.add('hidden');
            q('#demoPronto').classList.replace('flex', 'hidden');
            q('#demoAoVivo').textContent = 'Aguardando início';
            q('#demoTempo').textContent = '00:20';
            q('#demoIniciar').disabled = false;
            mostrarLendo(false);
        }

        function aplicarColeta(coleta, i) {
            mostrarLendo(false);
            q('#demoSemColetas')?.remove();
            q('#demoAmostra').style.background = coleta.cor;
            q('#demoResultado').textContent = coleta.resultado;
            q('#demoDescricao').textContent = coleta.descricao;
            q('#demoMarcador').classList.remove('hidden');
            q('#demoMarcador').style.left = `${coleta.posicao}%`;
            const minutos = 30 + i * 10;
            q('#demoTempo').textContent = [Math.floor(minutos / 60), minutos % 60]
                .map((n) => String(n).padStart(2, '0'))
                .join(':');
            q('#demoColetas').prepend(
                clonar('tplColeta', {
                    cor: { style: `background:${coleta.cor}` },
                    resultado: coleta.resultado,
                    detalhe: coleta.detalhe,
                    hora: coleta.hora,
                })
            );
        }

        q('#demoIniciar').addEventListener('click', () => {
            reiniciarDemo();
            q('#demoIniciar').disabled = true;
            q('#demoAoVivo').textContent = 'Ao vivo';
            COLETAS_DEMO.forEach((coleta, i) => {
                timers.push(setTimeout(() => mostrarLendo(true), i * passo + 200));
                timers.push(setTimeout(() => aplicarColeta(coleta, i), i * passo + passo * 0.6));
            });
            timers.push(
                setTimeout(() => {
                    q('#demoPronto').classList.replace('hidden', 'flex');
                    q('#demoAoVivo').textContent = 'Teste concluído';
                    q('#demoIniciar').disabled = false;
                }, COLETAS_DEMO.length * passo)
            );
        });
        q('#demoReiniciar').addEventListener('click', reiniciarDemo);
    }
})();
