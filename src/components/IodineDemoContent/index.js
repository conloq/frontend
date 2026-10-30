import { useEffect, useState } from 'react';

// Simulação do teste de iodo, sem etiqueta na tela por decisão de 21/10/2026 (conloq/mash#9); a leitura real virá do serviço Python + OpenCV (#34)
// Telas do Figma: "v2 · Iodo · Preparar sessão" e "v2 · Iodo · Leitura automática"
const POSITIVO = '#2e1f4a';
const PARCIAL = '#8a4b2a';
const NEGATIVO = '#d9a441';

const CLASSES = {
    amido: {
        nome: 'Presença de amido',
        icone: 'ph-x-circle text-danger',
        descricao: 'A amostra ainda reage ao iodo. A mosturação continua.',
    },
    parcial: {
        nome: 'Conversão parcial',
        icone: 'ph-circle-half text-warning',
        descricao:
            'Ainda há amido em degradação. Mantenha 66 °C; a próxima captura confirma o avanço.',
    },
    inconclusiva: {
        nome: 'Inconclusiva',
        icone: 'ph-warning text-muted-foreground',
        descricao: 'Reflexo forte na amostra. A captura foi repetida em seguida.',
    },
    ausencia: {
        nome: 'Ausência de amido',
        icone: 'ph-check-circle text-success',
        descricao: 'A amostra ficou amarela: não há amido detectável.',
    },
};

// minuto: minutos desde 14:05 (início da sessão); posicao: lugar na escala positivo → negativo, em %
const CAPTURAS = [
    { minuto: 5, classe: 'amido', cor: '#2a1c45', temp: 64.4, mostura: 10, posicao: 6 },
    { minuto: 15, classe: 'amido', cor: POSITIVO, temp: 65.9, mostura: 20, posicao: 14 },
    { minuto: 17, classe: 'inconclusiva', cor: null, temp: 66, mostura: 22 },
    { minuto: 25, classe: 'parcial', cor: '#6b3a3a', temp: 66.6, mostura: 30, posicao: 44 },
    { minuto: 35, classe: 'parcial', cor: PARCIAL, temp: 66.9, mostura: 40, posicao: 68 },
    { minuto: 45, classe: 'ausencia', cor: NEGATIVO, temp: 67.2, mostura: 50, posicao: 95 },
];

const ETAPAS_CALIBRACAO = [
    {
        nome: 'Padrão branco',
        esperado: 'Branco do suporte',
        cor: '#f2f0ec',
        hora: '14:02',
    },
    {
        nome: 'Controle positivo',
        esperado: 'Esperado: violeta ou azul-escuro',
        cor: POSITIVO,
        hora: '14:03',
        suporte: 'Controle positivo no suporte',
        instrucao:
            'Mosto cru com iodo, na mesma proporção das coletas. Centralize a amostra dentro do quadro laranja.',
    },
    {
        nome: 'Controle negativo',
        esperado: 'Esperado: amarelo ou âmbar',
        cor: NEGATIVO,
        hora: '14:04',
        suporte: 'Controle negativo no suporte',
        instrucao: 'Água com iodo, sem mosto. Centralize a amostra dentro do quadro laranja.',
    },
];

const INTERVALO = 600; // segundos simulados entre capturas (10 min)
const TICK = 250; // ms reais; cada tick avança 30 s simulados, então 10 min passam em 5 s

const hora = (minuto) => {
    const total = 14 * 60 + 5 + minuto;
    return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
};
const mmss = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
const grau = (t) => `${t.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} °C`;

function Selo({ className, icone, children }) {
    return (
        <span className={`${className} gap-2 before:hidden`}>
            <i className={`ph ${icone}`} aria-hidden="true" />
            {children}
        </span>
    );
}

function Cabecalho({ titulo, selo, subtitulo, children }) {
    return (
        <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="flex flex-col gap-1.5">
                <div className="flex flex-wrap items-center gap-3.5">
                    <h1 className="text-[30px] font-semibold">{titulo}</h1>
                    {selo}
                </div>
                <p className="text-muted-foreground">{subtitulo}</p>
            </div>
            {children}
        </div>
    );
}

function Rotulo({ icone, children, className = '' }) {
    return (
        <span
            className={`absolute left-4 flex items-center gap-2 rounded-lg bg-black/40 px-2.5 py-1.5 text-[13px] font-semibold text-[#f2e9e1] ${className}`}
        >
            <i className={`ph ${icone}`} aria-hidden="true" />
            {children}
        </span>
    );
}

// Reflexo da luz da bancada sobre a amostra, só na captura inconclusiva
const REFLEXO =
    'radial-gradient(ellipse 58% 44% at 38% 34%, rgba(255,255,255,0.97), rgba(255,255,255,0.6) 45%, rgba(255,255,255,0.12) 80%, transparent 100%)';

function Amostra({ cor, grande, reflexo = false }) {
    return (
        <span
            className={`grid place-items-center border-2 border-[#f5a04d] ${grande ? 'size-56 rounded-[28px] sm:size-70' : 'size-48 rounded-3xl sm:size-59'}`}
        >
            <span
                className={`relative overflow-hidden rounded-full transition-colors duration-700 motion-reduce:transition-none ${grande ? 'size-40 sm:size-50' : 'size-34 sm:size-42'}`}
                style={{ background: cor ?? '#3a2e29' }}
            >
                <span
                    className={`absolute inset-0 transition-opacity duration-500 motion-reduce:transition-none ${reflexo ? '' : 'opacity-0'}`}
                    style={{ background: REFLEXO }}
                    aria-hidden="true"
                />
            </span>
        </span>
    );
}

function Preparar({ onIniciar }) {
    const [passo, setPasso] = useState(1);
    const pronto = passo === ETAPAS_CALIBRACAO.length;
    const atual = ETAPAS_CALIBRACAO[passo];
    const faltam = ETAPAS_CALIBRACAO.length - passo;
    const amostra = ETAPAS_CALIBRACAO[Math.min(passo, ETAPAS_CALIBRACAO.length - 1)].cor;

    return (
        <>
            <Cabecalho
                titulo="Preparar a leitura do iodo"
                selo={
                    pronto ? (
                        <Selo className="badge-success" icone="ph-check">
                            Calibrada
                        </Selo>
                    ) : (
                        <Selo className="badge-info" icone="ph-crosshair">
                            Calibrando
                        </Selo>
                    )
                }
                subtitulo="Lote 12/03 · American Pale Ale · a câmera fica fixa e as configurações travam até o fim da sessão"
            />

            <div className="grid flex-1 gap-6 xl:grid-cols-[minmax(0,1fr)_460px]">
                <section
                    className="card flex flex-col overflow-hidden"
                    aria-label="Câmera da bancada"
                >
                    <div className="relative grid min-h-90 flex-1 place-items-center bg-[#1e1714] pt-24 pb-10 sm:py-16">
                        <Rotulo icone="ph-video-camera" className="top-4">
                            Câmera da bancada
                        </Rotulo>
                        <Rotulo icone="ph-lock-simple" className="top-14">
                            Foco, exposição e balanço de branco travados
                        </Rotulo>
                        <Amostra cor={amostra} grande />
                    </div>
                    <div
                        className="flex flex-wrap items-center gap-4 border-t border-border px-6 py-4.5"
                        aria-live="polite"
                    >
                        <div className="flex min-w-60 flex-1 flex-col gap-0.5">
                            <p className="font-semibold">
                                {atual?.suporte ?? 'Calibração concluída'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {atual?.instrucao ??
                                    'As duas referências estão salvas. Inicie a leitura automática.'}
                            </p>
                        </div>
                        {atual && (
                            <button
                                type="button"
                                id="demoCaptureControl"
                                className="btn-primary max-sm:w-full"
                                onClick={() => setPasso(passo + 1)}
                            >
                                <i className="ph ph-camera" aria-hidden="true" />
                                Capturar {atual.nome.toLowerCase()}
                            </button>
                        )}
                    </div>
                </section>

                <div className="flex flex-col gap-4">
                    <section
                        className="card flex flex-col gap-3 p-5"
                        aria-labelledby="calibrationTitle"
                    >
                        <h2 id="calibrationTitle" className="text-lg font-semibold">
                            Calibração da sessão
                        </h2>
                        <p className="text-sm leading-5 text-muted-foreground">
                            A luz muda de um dia para outro. Os controles desta sessão definem onde
                            fica cada classe.
                        </p>
                        {ETAPAS_CALIBRACAO.map((etapa, i) => {
                            const feito = i < passo;
                            const ativo = i === passo;
                            return (
                                <div
                                    key={etapa.nome}
                                    className={`flex items-center gap-3.5 rounded-xl bg-surface px-4 py-3.5 ${ativo ? 'border-2 border-action' : 'border border-border'}`}
                                >
                                    <span
                                        className={`grid size-8 shrink-0 place-items-center rounded-full ${feito ? 'bg-success-soft text-success' : ativo ? 'bg-action-soft text-action' : 'bg-background text-muted-foreground'}`}
                                    >
                                        <i
                                            className={`ph ${feito ? 'ph-check' : ativo ? 'ph-camera' : 'ph-circle'}`}
                                            aria-hidden="true"
                                        />
                                    </span>
                                    <span
                                        className={`flex flex-1 flex-col gap-0.5 ${feito || ativo ? '' : 'text-muted-foreground'}`}
                                    >
                                        <span className="font-semibold">{etapa.nome}</span>
                                        <span className="text-[13px] text-muted-foreground">
                                            {feito ? `Capturado às ${etapa.hora}` : etapa.esperado}
                                        </span>
                                    </span>
                                    {feito && (
                                        <span
                                            className="size-7 shrink-0 rounded-lg border border-border"
                                            style={{ background: etapa.cor }}
                                        />
                                    )}
                                </div>
                            );
                        })}
                    </section>

                    <section
                        className="card flex flex-col px-5 py-2"
                        aria-label="Configuração da sessão"
                    >
                        {[
                            ['ph-timer', 'Intervalo entre capturas', '10 min'],
                            ['ph-stack', 'Capturas no máximo', '6'],
                            ['ph-thermometer-simple', 'Começa na', 'Rampa 2 · 66 °C'],
                        ].map(([icone, rotulo, valor]) => (
                            <div
                                key={rotulo}
                                className="flex items-center gap-3 border-b border-border py-3 text-sm"
                            >
                                <i
                                    className={`ph ${icone} text-xl text-muted-foreground`}
                                    aria-hidden="true"
                                />
                                <span className="flex-1 text-muted-foreground">{rotulo}</span>
                                <span className="font-semibold">{valor}</span>
                            </div>
                        ))}
                        <span className="pt-1 pb-3 text-sm font-semibold text-action">
                            Alterar na receita
                        </span>
                    </section>

                    <section
                        className="card flex flex-col gap-3.5 p-5"
                        aria-labelledby="scaleTitle"
                    >
                        <h2 id="scaleTitle" className="text-lg font-semibold">
                            Escala desta sessão
                        </h2>
                        <div className="grid grid-cols-2 gap-3">
                            {ETAPAS_CALIBRACAO.slice(1).map((etapa, i) => {
                                const feito = passo > i + 1;
                                return (
                                    <div
                                        key={etapa.nome}
                                        className="flex items-center gap-2.5 rounded-[10px] bg-background p-3"
                                    >
                                        <span
                                            className="size-9 shrink-0 rounded-lg border border-border bg-surface transition-colors duration-700 motion-reduce:transition-none"
                                            style={feito ? { background: etapa.cor } : undefined}
                                        />
                                        <span className="flex min-w-0 flex-col gap-0.5">
                                            <span className="text-[13px] font-semibold">
                                                {etapa.nome}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                {feito
                                                    ? `Capturado às ${etapa.hora}`
                                                    : i === 0 || passo === 2
                                                      ? 'Aguardando captura'
                                                      : 'Depois do positivo'}
                                            </span>
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                        <p className="text-sm leading-[21px] text-muted-foreground">
                            Cada captura é comparada com essas duas cores. Perto do positivo, ainda
                            há amido; perto do negativo, a conversão terminou. O que fica no meio é
                            conversão parcial.
                        </p>
                    </section>
                </div>
            </div>

            <div className="sticky bottom-0 -mx-4 -mb-4 mt-auto flex flex-wrap items-center justify-end gap-3 border-t border-border bg-surface px-4 py-4 sm:-mx-6 sm:-mb-6 sm:px-6 lg:-mx-10 lg:-mb-8 lg:px-10">
                <p className="text-sm text-muted-foreground max-sm:hidden">
                    {pronto
                        ? 'Calibração concluída'
                        : `Falta${faltam > 1 ? 'm' : ''} ${faltam} etapa${faltam > 1 ? 's' : ''} da calibração`}
                </p>
                <button
                    type="button"
                    className="btn-secondary max-sm:hidden"
                    onClick={() => setPasso(1)}
                >
                    Cancelar
                </button>
                <button
                    type="button"
                    id="demoStart"
                    className="btn-primary max-sm:w-full"
                    disabled={!pronto}
                    onClick={onIniciar}
                >
                    <i className="ph ph-play" aria-hidden="true" />
                    Iniciar leitura automática
                </button>
            </div>
        </>
    );
}

function Grafico({ feitas }) {
    // 14:05 a 15:05 no eixo x; 64 a 68 °C no eixo y
    const x = (minuto) => (minuto / 60) * 100;
    const y = (temp) => ((68 - temp) / 4) * 100;
    const pontos = [{ minuto: 0, temp: 64 }, ...feitas];
    const ultima = feitas.at(-1);

    return (
        <section className="card flex flex-col overflow-hidden" aria-labelledby="chartTitle">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-6 py-4.5">
                <div className="flex flex-col gap-0.5">
                    <h2 id="chartTitle" className="text-lg font-semibold">
                        Temperatura e capturas
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Cada ponto é uma captura, na cor da classe, sobre a curva da mosturação
                    </p>
                </div>
                <ul className="flex flex-wrap gap-5 text-[13px] text-muted-foreground">
                    {[
                        [POSITIVO, 'amido'],
                        [PARCIAL, 'parcial'],
                        [NEGATIVO, 'ausencia'],
                    ].map(([cor, classe]) => (
                        <li key={classe} className="flex items-center gap-2">
                            <span className="size-3 rounded-full" style={{ background: cor }} />
                            {CLASSES[classe].nome}
                        </li>
                    ))}
                </ul>
            </div>
            <div className="flex gap-3 px-6 py-4">
                <div className="flex h-64 flex-col justify-between pb-5.5 text-xs text-muted-foreground">
                    <span>68 °C</span>
                    <span>66 °C</span>
                    <span>64 °C</span>
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <div
                        className="relative h-58"
                        role="img"
                        aria-label="Curva de temperatura com as capturas"
                    >
                        {[0, 50, 100].map((top) => (
                            <span
                                key={top}
                                className="absolute inset-x-0 h-px bg-border"
                                style={{ top: `${top}%` }}
                            />
                        ))}
                        <svg
                            className="absolute inset-0 size-full overflow-visible"
                            viewBox="0 0 100 100"
                            preserveAspectRatio="none"
                            aria-hidden="true"
                        >
                            <polyline
                                points={pontos.map((p) => `${x(p.minuto)},${y(p.temp)}`).join(' ')}
                                fill="none"
                                stroke="#6b5f57"
                                strokeWidth="2"
                                vectorEffect="non-scaling-stroke"
                            />
                        </svg>
                        {ultima && (
                            <span
                                className="absolute inset-y-0 w-px bg-action"
                                style={{ left: `${x(ultima.minuto)}%` }}
                            />
                        )}
                        {feitas.map((p) => (
                            <span
                                key={p.minuto}
                                className={`absolute size-4 -translate-1/2 rounded-full border-2 ${p.cor ? 'border-surface' : 'border-muted-foreground bg-surface'}`}
                                style={{
                                    left: `${x(p.minuto)}%`,
                                    top: `${y(p.temp)}%`,
                                    background: p.cor ?? undefined,
                                }}
                            />
                        ))}
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                        {[0, 15, 30, 45, 60].map((m) => (
                            <span key={m}>{hora(m)}</span>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

function Leitura({ onEncerrar }) {
    const [feitas, setFeitas] = useState(0);
    const [restante, setRestante] = useState(INTERVALO);
    const fim = feitas === CAPTURAS.length;

    const capturar = () => setRestante(0);

    useEffect(() => {
        if (fim) return undefined;
        const id = setInterval(() => setRestante((s) => s - 30), TICK);
        return () => clearInterval(id);
    }, [fim]);

    useEffect(() => {
        if (restante > 0) return;
        setFeitas((n) => Math.min(n + 1, CAPTURAS.length));
        setRestante(INTERVALO);
    }, [restante]);

    const lista = CAPTURAS.slice(0, feitas);
    const atual = lista.at(-1);
    const classe = atual && CLASSES[atual.classe];
    // a inconclusiva não move o marcador: fica a última classificação válida
    const marcador = lista.findLast((c) => c.posicao !== undefined);

    return (
        <>
            <Cabecalho
                titulo="Leitura automática"
                selo={
                    fim ? (
                        <Selo className="badge-success" icone="ph-check">
                            Leitura concluída
                        </Selo>
                    ) : (
                        <Selo className="badge bg-action-soft text-action" icone="ph-camera">
                            Capturando a cada 10 min
                        </Selo>
                    )
                }
                subtitulo="Lote 12/03 · American Pale Ale · sessão calibrada às 14:05"
            >
                <div className="actions">
                    <button
                        type="button"
                        id="demoEnd"
                        className="btn-secondary"
                        onClick={onEncerrar}
                    >
                        <i className="ph ph-stop" aria-hidden="true" />
                        Encerrar leitura
                    </button>
                    <button
                        type="button"
                        id="demoCapture"
                        className="btn-primary"
                        onClick={capturar}
                        disabled={fim}
                    >
                        <i className="ph ph-camera" aria-hidden="true" />
                        Capturar agora
                    </button>
                </div>
            </Cabecalho>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_440px]">
                <section
                    className="card flex flex-col overflow-hidden min-[1800px]:flex-row"
                    aria-label="Última captura"
                >
                    <div className="relative grid min-h-96 place-items-center bg-[#1e1714] min-[1800px]:w-[440px] min-[1800px]:shrink-0">
                        <Rotulo icone="ph-video-camera" className="top-4">
                            Câmera da bancada
                        </Rotulo>
                        <Amostra
                            cor={atual?.cor ?? marcador?.cor}
                            reflexo={atual?.classe === 'inconclusiva'}
                        />
                        {!fim && (
                            <Rotulo icone="ph-timer" className="bottom-4">
                                Próxima captura em {mmss(Math.max(restante, 0))}
                            </Rotulo>
                        )}
                    </div>
                    <div
                        className="flex min-w-0 flex-1 flex-col gap-5 p-6 sm:p-8"
                        aria-live="polite"
                    >
                        <div className="flex flex-col gap-1.5">
                            <p className="text-[13px] text-muted-foreground">
                                {atual
                                    ? `Última captura · ${hora(atual.minuto)}`
                                    : 'Sessão iniciada · 14:05'}
                            </p>
                            <p
                                id="demoResult"
                                className="flex items-center gap-2.5 font-display text-[26px] leading-tight font-semibold sm:text-[32px]"
                            >
                                {classe && (
                                    <i
                                        className={`ph-fill ${classe.icone} text-[28px]`}
                                        aria-hidden="true"
                                    />
                                )}
                                {classe?.nome ?? 'Aguardando a primeira captura'}
                            </p>
                            <p className="leading-[23px] text-muted-foreground">
                                {classe?.descricao ??
                                    'A câmera fotografa a amostra a cada 10 minutos e classifica a cor.'}
                            </p>
                        </div>

                        <div className="flex flex-col gap-2.5">
                            <div className="relative h-6">
                                <span className="absolute inset-x-0 top-1.5 h-3 rounded-full bg-linear-to-r from-[#2e1f4a] via-[#8a4b2a] to-[#d9a441]" />
                                {marcador && (
                                    <span
                                        className="absolute top-0 size-6 -translate-x-1/2 rounded-full border-3 border-foreground bg-surface transition-[left] duration-700 motion-reduce:transition-none"
                                        style={{ left: `${marcador.posicao}%` }}
                                    />
                                )}
                            </div>
                            <div className="grid grid-cols-3 gap-3 text-xs">
                                <span className="flex flex-col gap-0.5">
                                    <strong className="font-semibold">Controle positivo</strong>
                                    <span className="text-muted-foreground">com amido</span>
                                </span>
                                <strong className="text-center font-semibold">
                                    Conversão parcial
                                </strong>
                                <span className="flex flex-col items-end gap-0.5 text-right">
                                    <strong className="font-semibold">Controle negativo</strong>
                                    <span className="text-muted-foreground">sem amido</span>
                                </span>
                            </div>
                        </div>

                        <dl className="grid grid-cols-[repeat(auto-fit,minmax(9rem,1fr))] gap-3 border-t border-border pt-5">
                            {[
                                [
                                    'ph-thermometer-simple',
                                    'Temperatura',
                                    grau(atual?.temp ?? 64),
                                    'Alvo da rampa: 66 °C',
                                ],
                                [
                                    'ph-timer',
                                    'Mosturação',
                                    `${atual?.mostura ?? 0} min`,
                                    'Desde 14:05',
                                ],
                                ['ph-stairs', 'Rampa', '2 de 3', 'Sacarificação'],
                                [
                                    'ph-lightning',
                                    'Análise da imagem',
                                    atual ? '1,4 s' : '–',
                                    'Por captura',
                                ],
                            ].map(([icone, rotulo, valor, detalhe]) => (
                                <div
                                    key={rotulo}
                                    className="flex min-w-0 flex-col gap-1 rounded-[10px] bg-background px-3.5 py-3"
                                >
                                    <dt className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
                                        <i className={`ph ${icone} text-base`} aria-hidden="true" />
                                        {rotulo}
                                    </dt>
                                    <dd className="font-display text-xl font-semibold">{valor}</dd>
                                    <dd className="text-xs text-muted-foreground">{detalhe}</dd>
                                </div>
                            ))}
                        </dl>

                        {fim && (
                            <div
                                id="demoReady"
                                className="flex items-center gap-3 rounded-[10px] bg-success-soft px-4 py-3"
                            >
                                <i
                                    className="ph-fill ph-check-circle text-[22px] text-success"
                                    aria-hidden="true"
                                />
                                <p>
                                    <strong className="font-semibold">
                                        Pronto para a fervura.
                                    </strong>{' '}
                                    A amostra não reage mais ao iodo.
                                </p>
                            </div>
                        )}
                    </div>
                </section>

                <section
                    className="card self-start overflow-hidden"
                    aria-labelledby="capturesTitle"
                >
                    <div className="flex flex-col gap-0.5 border-b border-border px-5 py-4.5">
                        <h2 id="capturesTitle" className="text-lg font-semibold">
                            Capturas da sessão
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Da mais recente para a mais antiga
                        </p>
                    </div>
                    <ol id="demoSamples" className="flex flex-col">
                        {!lista.length && (
                            <li className="px-5 py-8 text-center text-sm text-muted-foreground">
                                As capturas aparecem aqui.
                            </li>
                        )}
                        {[...lista].reverse().map((c) => (
                            <li
                                key={c.minuto}
                                className="list-row flex items-center gap-3 px-5 py-3"
                            >
                                <span
                                    className={`size-8 shrink-0 rounded-lg ${c.cor ? '' : 'border border-border bg-background'}`}
                                    style={c.cor ? { background: c.cor } : undefined}
                                />
                                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                                    <span className="flex items-center gap-1.5 text-sm font-semibold">
                                        <i
                                            className={`ph-fill ${CLASSES[c.classe].icone}`}
                                            aria-hidden="true"
                                        />
                                        {CLASSES[c.classe].nome}
                                    </span>
                                    <span className="text-[13px] text-muted-foreground">
                                        {c.cor
                                            ? `${grau(c.temp)} · ${c.mostura} min`
                                            : 'Reflexo forte · repetida'}
                                    </span>
                                </span>
                                <span className="text-sm font-semibold text-muted-foreground">
                                    {hora(c.minuto)}
                                </span>
                            </li>
                        ))}
                    </ol>
                </section>
            </div>

            <Grafico feitas={lista} />
        </>
    );
}

export default function IodineDemoContent({ lendo, onLendo }) {
    return lendo ? (
        <Leitura onEncerrar={() => onLendo(false)} />
    ) : (
        <Preparar onIniciar={() => onLendo(true)} />
    );
}
