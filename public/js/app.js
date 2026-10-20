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
        location.replace('/recipes');
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
        location.href = '/recipes';
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
        qa('[data-user="urlImage"]').forEach((el) => {
            if (user.urlImage) el.src = user.urlImage;
        });
        qa('[data-user="createdAt"]').forEach((el) => {
            if (user.createdAt) el.textContent = new Date(user.createdAt).toLocaleDateString('pt-BR');
        });

        const perfil = q('#formPerfil');
        if (perfil) {
            perfil.elements.name.value = user.name ?? '';
            perfil.elements.email.value = user.email ?? '';
            perfil.elements.phone.value = user.phone ?? '';
        }
    }

    if (!paginaPublica) carregarUsuario();

    q('#formPerfil')?.addEventListener('submit', async (event) => {
        event.preventDefault();
        const { name, email, phone, password } = formData(event.target);

        const { status, data } = await api('PUT', '/user', {
            name,
            email,
            phone,
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

        const { status, data } = await api('GET', '/recipes');
        if (status !== 200) {
            return mostrarMensagem('danger', mensagemDaApi(data, 'Não foi possível carregar as receitas'));
        }

        const receitas = data.recipes ?? [];
        if (!receitas.length) {
            lista.innerHTML = '<p class="p-5 text-sm text-stone-500">Nenhuma receita criada.</p>';
            return;
        }

        const temperaturas = await Promise.all(
            receitas.map((r) => api('GET', `/recipes/${r.id}/temperatures`)),
        );

        const failed = temperaturas.find((result) => result.status !== 200);
        if (failed) return mostrarMensagem('danger', mensagemDaApi(failed.data, 'Não foi possível carregar as rampas'));

        lista.innerHTML = receitas.map((r, i) => {
            const t = temperaturas[i].data.temperatures?.[0];

            return `
          <div class="grid grid-cols-[1.5fr_1fr_1fr_1fr_150px] items-center gap-4 border-b border-stone-50 p-5 text-sm">
            <span class="font-semibold text-mash-brown"><a href="/recipes/${escapar(r.id)}">${escapar(r.name)}</a></span>
            <span>${t ? escapar(t.timer) : '-'}</span>
            <span>${t ? `${escapar(t.minTemperatureRamp)}°C` : '-'}</span>
            <span>${t ? `${escapar(t.maxTemperatureRamp)}°C` : '-'}</span>
            <span class="flex items-center gap-2">
              <a href="/recipes/${escapar(r.id)}/edit" class="inline-flex min-h-11 min-w-11 items-center justify-center" aria-label="Editar receita" title="Editar receita"><i class="ph ph-pencil" aria-hidden="true"></i></a>
              <a
                href="/recipes/${escapar(r.id)}/temperatures/new"
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

        const { status, data } = await api('DELETE', `/recipes/${botao.dataset.excluir}`);
        if (status !== 204) {
            return mostrarMensagem('danger', mensagemDaApi(data, 'Não foi possível excluir a receita'));
        }

        mostrarMensagem('success', 'Receita excluída');
        carregarReceitas();
    });

    q('#formReceita')?.addEventListener('submit', async (event) => {
        event.preventDefault();
        const { name } = formData(event.target);

        const { status, data } = await api('POST', '/recipes', { name });
        if (status !== 201) {
            return mostrarMensagem('danger', mensagemDaApi(data, 'Não foi possível criar a receita'));
        }

        irPara('/recipes', 'success', mensagemDaApi(data, 'Receita criada com sucesso'));
    });

    carregarReceitas();

    async function carregarDetalhe() {
        const form = q('#formEditarReceita');
        if (!form) return;
        const id = location.pathname.match(/^\/recipes\/([1-9][0-9]*)(?:\/edit)?$/)?.[1];
        if (!id) return mostrarMensagem('danger', 'ID inválido');
        const { status, data } = await api('GET', `/recipes/${id}`);
        if (status !== 200) return mostrarMensagem('danger', mensagemDaApi(data, 'Não foi possível carregar a receita'));
        form.elements.name.value = data.recipe.name;
        q('#recipeName').textContent = data.recipe.name;
        q('#newTemperatureLink').href = `/recipes/${id}/temperatures/new`;
        const ramps = await api('GET', `/recipes/${id}/temperatures`);
        if (ramps.status !== 200) return mostrarMensagem('danger', mensagemDaApi(ramps.data, 'Não foi possível carregar as rampas'));
        q('#detalheRampas').textContent = ramps.data.temperatures.length
            ? ramps.data.temperatures.map((t) => `Rampa ${t.orderRamp ?? '-'}: ${t.minTemperatureRamp}–${t.maxTemperatureRamp} °C; tempo ${t.timer}`).join(' | ')
            : 'Nenhuma rampa cadastrada.';
        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            const { status, data } = await api('PUT', `/recipes/${id}`, { name: form.elements.name.value.trim() });
            if (status !== 200) return mostrarMensagem('danger', mensagemDaApi(data, 'Não foi possível salvar a receita'));
            irPara('/recipes', 'success', mensagemDaApi(data, 'Receita atualizada com sucesso'));
        });
    }
    carregarDetalhe();

    // ------------------------------------------------------------ temperatura

    q('#formTemperatura')?.addEventListener('submit', async (event) => {
        event.preventDefault();
        const campos = formData(event.target);
        const receitaId = location.pathname.match(/^\/recipes\/([1-9][0-9]*)\/temperatures\/new$/)?.[1];
        if (!/^\d+$/.test(receitaId ?? '')) {
            return mostrarMensagem('danger', 'Receita inválida');
        }

        const keys = ['minTemperatureRamp', 'maxTemperatureRamp', 'minTemperatureLimit', 'maxTemperatureLimit'];
        if (keys.some((key) => campos[key] === '' || !Number.isInteger(Number(campos[key])) || Number(campos[key]) < 0 || Number(campos[key]) > 100)) return mostrarMensagem('danger', 'Temperaturas devem ser inteiras entre 0 e 100 °C');
        if (Number(campos.minTemperatureRamp) > Number(campos.maxTemperatureRamp) || Number(campos.minTemperatureLimit) > Number(campos.maxTemperatureLimit)) return mostrarMensagem('danger', 'Temperatura mínima não pode superar a máxima');
        const time = (value) => /^\d{2}:\d{2}$/.test(value ?? '') ? value + ':00' : value;
        if (['timer', 'initialization', 'idealTime'].some((key) => !/^([01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/.test(time(campos[key]) ?? ''))) return mostrarMensagem('danger', 'Horários devem seguir HH:MM:SS');
        if (campos.orderRamp && (!Number.isInteger(Number(campos.orderRamp)) || Number(campos.orderRamp) < -2147483648 || Number(campos.orderRamp) > 2147483647)) return mostrarMensagem('danger', 'Ordem da rampa deve ser um inteiro válido');
        const { status, data } = await api('POST', `/recipes/${receitaId}/temperatures`, {
            minTemperatureRamp: Number(campos.minTemperatureRamp),
            maxTemperatureRamp: Number(campos.maxTemperatureRamp),
            minTemperatureLimit: Number(campos.minTemperatureLimit),
            maxTemperatureLimit: Number(campos.maxTemperatureLimit),
            timer: time(campos.timer),
            initialization: time(campos.initialization),
            idealTime: time(campos.idealTime),
            ...(campos.orderRamp !== undefined && campos.orderRamp !== '' && { orderRamp: Number(campos.orderRamp) }),
        });
        if (status !== 201) {
            return mostrarMensagem('danger', mensagemDaApi(data, 'Não foi possível salvar a temperatura'));
        }

        irPara('/recipes', 'success', mensagemDaApi(data, 'Temperatura criada com sucesso'));
    });
})();
