// Consumo da API do Back-End direto do navegador (CORS liberado no Back-End).
// O token JWT fica no localStorage e vai como Bearer em cada chamada.
(() => {
    const API = window.API_URL;
    const TOKEN_KEY = 'mash-token';
    const FLASH_KEY = 'mash-flash';
    const ESTILOS = {
        danger: 'border-red-200 bg-red-50 text-red-700',
        warning: 'border-amber-200 bg-amber-50 text-amber-800',
        success: 'border-green-200 bg-green-50 text-green-700',
    };

    const q = (selector) => document.querySelector(selector);
    const qa = (selector) => document.querySelectorAll(selector);
    const paginaPublica = ['/login', '/cadastro'].includes(location.pathname);

    // ------------------------------------------------------------ storage

    const guardar = {
        get: (key) => { try { return localStorage.getItem(key); } catch { return null; } },
        set: (key, value) => { try { localStorage.setItem(key, value); } catch { /* sem storage */ } },
        del: (key) => { try { localStorage.removeItem(key); } catch { /* sem storage */ } },
    };

    // ------------------------------------------------------------ mensagens

    function mostrarMensagem(tipo, texto) {
        const area = q('#mensagens');
        if (!area) return;

        const p = document.createElement('p');
        p.setAttribute('role', 'alert');
        p.className = `mb-4 rounded-xl border px-4 py-3 text-sm font-semibold ${ESTILOS[tipo]}`;
        p.textContent = texto;
        area.replaceChildren(p);
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
        } catch { /* flash inválido */ }
    }

    // ------------------------------------------------------------ API

    const mensagemDaApi = (data, padrao) => data.error ?? data.message ?? padrao;

    // Nunca lança: devolve { status, data }
    async function api(metodo, caminho, corpo) {
        const token = guardar.get(TOKEN_KEY);

        try {
            // FormData (upload de foto): o navegador define o Content-Type com o boundary
            const multipart = corpo instanceof FormData;
            const resposta = await fetch(API + caminho, {
                method: metodo,
                headers: {
                    ...(!multipart && { 'Content-Type': 'application/json' }),
                    ...(token && { Authorization: `Bearer ${token}` }),
                },
                ...(corpo && { body: multipart ? corpo : JSON.stringify(corpo) }),
            });
            const data = await resposta.json().catch(() => ({}));

            // Token ausente, inválido ou expirado: volta ao login
            if (resposta.status === 401 && token) {
                guardar.del(TOKEN_KEY);
                irPara('/login', 'warning', mensagemDaApi(data, 'Sessão expirada. Entre novamente.'));
            }

            return { status: resposta.status, data };
        } catch {
            return { status: 503, data: { error: 'Não foi possível falar com a API' } };
        }
    }

    function sair(texto) {
        guardar.del(TOKEN_KEY);
        irPara('/login', 'success', texto);
    }

    const formData = (form) => Object.fromEntries(new FormData(form));

    // Protege texto para HTML e para atributos (href, data-*)
    function escapar(texto) {
        const div = document.createElement('div');
        div.textContent = texto ?? '';
        return div.innerHTML.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    // ------------------------------------------------------------ guarda de rota

    if (!paginaPublica && !guardar.get(TOKEN_KEY)) {
        location.replace('/login');
        return;
    }
    if (paginaPublica && guardar.get(TOKEN_KEY)) {
        location.replace('/receitas');
        return;
    }

    mostrarFlash();

    // ------------------------------------------------------------ login e cadastro

    q('#formLogin')?.addEventListener('submit', async (event) => {
        event.preventDefault();
        const { email, password } = formData(event.target);

        const { status, data } = await api('POST', '/login', { email, password });
        if (status !== 200) {
            return mostrarMensagem('danger', mensagemDaApi(data, 'Não foi possível entrar'));
        }

        if (!data.token) {
            return mostrarMensagem('danger', mensagemDaApi(data, 'Não foi possível entrar'));
        }

        guardar.set(TOKEN_KEY, data.token);
        location.href = '/receitas';
    });

    q('#formCadastro')?.addEventListener('submit', async (event) => {
        event.preventDefault();
        const { name, email, password, confirmarSenha } = formData(event.target);

        if (password !== confirmarSenha) {
            return mostrarMensagem('danger', 'As senhas não conferem');
        }

        const { status, data } = await api('POST', '/user', { name, email, password });
        if (status !== 201) {
            return mostrarMensagem('danger', mensagemDaApi(data, 'Não foi possível cadastrar'));
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

    async function carregarUsuario() {
        const { status, data } = await api('GET', '/user');
        if (status !== 200 || !data.user) return;

        const user = data.user;
        qa('[data-user="name"]').forEach((el) => { el.textContent = user.name ?? ''; });
        qa('[data-user="email"]').forEach((el) => { el.textContent = user.email ?? ''; });
        qa('[data-user="url_image"]').forEach((el) => {
            if (user.url_image) el.src = user.url_image;
        });
        qa('[data-user="createdAt"]').forEach((el) => {
            if (user.createdAt) el.textContent = new Date(user.createdAt).toLocaleDateString('pt-BR');
        });

        const perfil = q('#formPerfil');
        if (perfil) {
            perfil.elements.name.value = user.name ?? '';
            perfil.elements.email.value = user.email ?? '';
            perfil.elements.fone.value = user.fone ?? '';
        }
    }

    if (!paginaPublica) carregarUsuario();

    q('#formPerfil')?.addEventListener('submit', async (event) => {
        event.preventDefault();
        const { name, email, fone, password } = formData(event.target);

        const { status, data } = await api('PUT', '/user', {
            name,
            email,
            fone,
            ...(password && { password }),
        });
        if (status !== 200) {
            return mostrarMensagem('danger', mensagemDaApi(data, 'Não foi possível salvar'));
        }

        irPara('/usuario', 'success', mensagemDaApi(data, 'Usuário atualizado com sucesso'));
    });

    q('#formFoto')?.addEventListener('submit', async (event) => {
        event.preventDefault();
        const arquivo = q('#inputFoto')?.files[0];
        if (!arquivo) return mostrarMensagem('danger', 'Nenhuma imagem foi enviada');

        const corpo = new FormData();
        corpo.append('image', arquivo);

        const { status, data } = await api('PUT', '/user/upload', corpo);
        if (status !== 200) {
            return mostrarMensagem('danger', mensagemDaApi(data, 'Não foi possível enviar a foto'));
        }

        irPara('/usuario', 'success', mensagemDaApi(data, 'Imagem enviada com sucesso!'));
    });

    q('#btnExcluir')?.addEventListener('click', async () => {
        if (!confirm('Deseja mesmo excluir a sua conta?')) return;

        const { status, data } = await api('DELETE', '/user');
        if (status !== 204) {
            return mostrarMensagem('danger', mensagemDaApi(data, 'Não foi possível excluir a conta'));
        }

        sair('Conta excluída');
    });

    // ------------------------------------------------------------ receitas

    async function carregarReceitas() {
        const lista = q('#listaReceitas');
        if (!lista) return;

        const { status, data } = await api('GET', '/receitas');
        if (status !== 200) {
            return mostrarMensagem('danger', mensagemDaApi(data, 'Não foi possível carregar as receitas'));
        }

        const receitas = data.recipe ?? [];
        if (!receitas.length) {
            lista.innerHTML = '<p class="p-5 text-sm text-stone-500">Nenhuma receita criada.</p>';
            return;
        }

        const temperaturas = await Promise.all(
            receitas.map((r) => api('GET', `/receitas/temperatura/${r.id}`)),
        );

        lista.innerHTML = receitas.map((r, i) => {
            const t = temperaturas[i].data.temperatures?.[0];

            return `
          <div class="grid grid-cols-[1.5fr_1fr_1fr_1fr_150px] items-center gap-4 border-b border-stone-50 p-5 text-sm">
            <span class="font-semibold text-mash-brown">${escapar(r.name)}</span>
            <span>${t ? escapar(t.timer) : '-'}</span>
            <span>${t ? `${escapar(t.min_temperature_ramp)}°C` : '-'}</span>
            <span>${t ? `${escapar(t.max_temperature_ramp)}°C` : '-'}</span>
            <span class="flex items-center gap-2">
              <a
                href="/receitas/temperatura/cadastrar/${escapar(r.id)}"
                class="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg bg-sky-600 p-2 font-bold text-white transition hover:bg-sky-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
                title="Adicionar temperatura"
                aria-label="Adicionar temperatura"
              ><i class="ph ph-plus" aria-hidden="true"></i></a>
              <button
                type="button"
                data-excluir="${escapar(r.id)}"
                title="Excluir receita"
                aria-label="Excluir receita"
                class="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg bg-red-600 p-2 font-bold text-white transition hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
              ><i class="ph ph-trash" aria-hidden="true"></i></button>
            </span>
          </div>`;
        }).join('');
    }

    q('#listaReceitas')?.addEventListener('click', async (event) => {
        const botao = event.target.closest('[data-excluir]');
        if (!botao || !confirm('Deseja mesmo excluir a receita?')) return;

        const { status, data } = await api('DELETE', `/receitas/${botao.dataset.excluir}`);
        if (status !== 204) {
            return mostrarMensagem('danger', mensagemDaApi(data, 'Não foi possível excluir a receita'));
        }

        mostrarMensagem('success', 'Receita excluída');
        carregarReceitas();
    });

    q('#formReceita')?.addEventListener('submit', async (event) => {
        event.preventDefault();
        const { name } = formData(event.target);

        const { status, data } = await api('POST', '/receitas', { name });
        if (status !== 201) {
            return mostrarMensagem('danger', mensagemDaApi(data, 'Não foi possível criar a receita'));
        }

        irPara('/receitas', 'success', mensagemDaApi(data, 'Receita criada com sucesso'));
    });

    carregarReceitas();

    // ------------------------------------------------------------ temperatura

    q('#formTemperatura')?.addEventListener('submit', async (event) => {
        event.preventDefault();
        const campos = formData(event.target);
        const receitaId = location.pathname.split('/').pop();
        if (!/^\d+$/.test(receitaId ?? '')) {
            return mostrarMensagem('danger', 'Receita inválida');
        }

        const { status, data } = await api('POST', `/receitas/temperatura/${receitaId}`, {
            min_temperature_ramp: Number(campos.min_temperature_ramp),
            max_temperature_ramp: Number(campos.max_temperature_ramp),
            min_temperature_limit: Number(campos.min_temperature_limit),
            max_temperature_limit: Number(campos.max_temperature_limit),
            timer: campos.timer,
            initialization: campos.initialization,
            ideal_time: campos.ideal_time,
        });
        if (status !== 201) {
            return mostrarMensagem('danger', mensagemDaApi(data, 'Não foi possível salvar a temperatura'));
        }

        irPara('/receitas', 'success', mensagemDaApi(data, 'Temperatura criada com sucesso'));
    });
})();
