// code-wiki:start
// Summary: Handle browser-side form feedback, recipe visuals, and the iodine demonstration.
// Description: Template clones fill slots through text and attributes, while alerts and field errors update existing markup.
// Profile and recipe forms validate required names, password confirmation, ramp temperatures, and clock values before submission.
// Ramp data is converted into a proportional timeline with temperature bands and accessible summary text.
// The recipe iodine form previews capture timing from the selected ramp without sending a session request.
// The demonstration schedules sample iodine results, honors reduced-motion timing, and allows the sequence to restart.
// Actions marked without an API route are prevented from submitting, and user-facing feedback remains in the page.
// code-wiki:end
/* global prenderFoco */
// Páginas e dados chegam renderizados pelo EJS; este arquivo cuida das interações do navegador.
(() => {
    const q = (selector, raiz = document) => raiz.querySelector(selector);
    const qa = (selector, raiz = document) => raiz.querySelectorAll(selector);
    const caminho = location.pathname;
    const rota = (regex) => caminho.match(regex)?.[1];

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

    // ------------------------------------------------------------ diálogo de confirmação

    function confirmar({ titulo, mensagem, botao = 'Excluir' }) {
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
            const teclado = (event) => {
                if (event.key === 'Escape') fechar(false);
            };
            const clique = (event) => {
                if (event.target === dialogo) return fechar(false);
                const escolha = event.target.closest('[data-confirmar]');
                if (!escolha) return;
                fechar(escolha.dataset.confirmar === 'sim');
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

    const formData = (form) => Object.fromEntries(new FormData(form));

    // ------------------------------------------------------------ usuário (telas logadas)

    function preencherPerfil() {
        const perfil = q('#formPerfil');
        if (!perfil) return;
        perfil.reset();
        perfil.elements.password.value = '';
        perfil.elements.confirmarSenha.value = '';
        limparErros(perfil);
    }

    q('#btnDescartar')?.addEventListener('click', preencherPerfil);

    const volume = q('#volume');
    volume?.addEventListener('input', () =>
        volume.setAttribute('aria-valuetext', ['Baixo', 'Médio', 'Alto'][volume.value])
    );

    q('#formPerfil')?.addEventListener('submit', (event) => {
        const form = event.target;
        const { name, email, password, confirmarSenha } = formData(form);
        limparErros(form);

        if (!name.trim()) erroCampo(form, 'name', 'Informe seu nome.');
        if (!email.trim()) erroCampo(form, 'email', 'Informe seu e-mail.');
        if (password && /\s/.test(password))
            erroCampo(form, 'password', 'A senha não pode conter espaços');
        if (password && password !== confirmarSenha)
            erroCampo(form, 'confirmarSenha', 'As senhas não conferem');
        if (q('.campo-erro', form)) {
            event.preventDefault();
            focarPrimeiroErro(form);
        }
    });

    // ------------------------------------------------------------ receitas

    const linhasReceita = [...qa('#listaReceitas [data-receita-nome]')];
    if (q('#contagemReceitas'))
        q('#contagemReceitas').textContent = plural(linhasReceita.length, 'receita', 'receitas');
    q('#buscaReceitas')?.addEventListener('input', (event) => {
        const termo = event.target.value.trim().toLowerCase();
        linhasReceita.forEach((linha) => {
            linha.hidden = !linha.dataset.receitaNome.includes(termo);
        });
    });
    qa('form[data-confirmar-titulo]').forEach((form) =>
        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            const confirmado = await confirmar({
                titulo: form.dataset.confirmarTitulo,
                mensagem: form.dataset.confirmarMensagem,
                botao: form.dataset.confirmarBotao,
            });
            if (confirmado) form.submit();
        })
    );

    q('#formReceita')?.addEventListener('submit', (event) => {
        const form = event.target;
        const name = formData(form).name.trim();
        limparErros(form);

        if (!name) {
            event.preventDefault();
            erroCampo(form, 'name', 'Nome não pode estar vazio');
            focarPrimeiroErro(form);
        }
    });

    // ------------------------------------------------------------ detalhe da receita

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

    const dadosRampas = q('#detalheRampas')?.dataset.rampas;
    if (dadosRampas) {
        try {
            desenharPerfil(JSON.parse(dadosRampas));
        } catch {
            desenharPerfil(null);
        }
    }

    const formEditarReceita = q('#formEditarReceita');
    if (formEditarReceita) {
        formEditarReceita.addEventListener('submit', (event) => {
            const name = formEditarReceita.elements.name.value.trim();
            limparErros(formEditarReceita);
            if (!name) {
                event.preventDefault();
                erroCampo(formEditarReceita, 'name', 'Nome não pode estar vazio');
                focarPrimeiroErro(formEditarReceita);
            }
        });
    }

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
        // Edição recebe a rampa renderizada pelo EJS; salvar aguarda a rota da API (#97).
        if (idRampa) return;

        form.addEventListener('submit', (event) => {
            const campos = formData(form);
            limparErros(form);

            if (!validarRampa(form, campos)) {
                event.preventDefault();
                mostrarAlerta('danger', 'Confira os campos marcados', 'Corrija e salve de novo.');
                focarPrimeiroErro(form);
            }
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
        // a calibração da sessão acontece antes da primeira captura
        const calibracao = clonar('tplCalibracaoPrevia', {});
        calibracao.style.left = pos(Math.max(0, primeira - intervalo / 2));
        capturas.replaceChildren(
            calibracao,
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

        let rampas = [];
        try {
            rampas = JSON.parse(form.dataset.rampas ?? '[]');
        } catch {
            rampas = [];
        }

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
