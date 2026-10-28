import { useEffect, useRef, useState } from 'react';
import AppShell from '@/components/AppShell';

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

const INICIAL = { coletas: 0, lendo: false, fase: 'aguardando' };
const SELO = { aguardando: 'Aguardando início', aoVivo: 'Ao vivo', concluido: 'Teste concluído' };

const relogio = (min) =>
    [Math.floor(min / 60), min % 60].map((n) => String(n).padStart(2, '0')).join(':');

function Demo() {
    const [estado, setEstado] = useState(INICIAL);
    const timers = useRef([]);

    const limpar = () => {
        timers.current.forEach(clearTimeout);
        timers.current = [];
    };
    useEffect(() => limpar, []);

    const reiniciar = () => {
        limpar();
        setEstado(INICIAL);
    };

    const iniciar = () => {
        reiniciar();
        setEstado({ ...INICIAL, fase: 'aoVivo' });
        const passo = matchMedia('(prefers-reduced-motion: reduce)').matches ? 1200 : 2200;
        const agendar = (fn, ms) => timers.current.push(setTimeout(fn, ms));
        COLETAS_DEMO.forEach((_, i) => {
            agendar(() => setEstado((atual) => ({ ...atual, lendo: true })), i * passo + 200);
            agendar(
                () => setEstado((atual) => ({ ...atual, lendo: false, coletas: i + 1 })),
                i * passo + passo * 0.6
            );
        });
        agendar(
            () => setEstado((atual) => ({ ...atual, fase: 'concluido' })),
            COLETAS_DEMO.length * passo
        );
    };

    const atual = COLETAS_DEMO[estado.coletas - 1];
    const feitas = COLETAS_DEMO.slice(0, estado.coletas).reverse();

    return (
        <>
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div className="flex flex-col gap-1.5">
                    <h1 className="text-[30px] font-semibold">Teste de iodo</h1>
                    <p className="max-w-3xl text-texto-2">
                        Como vai funcionar: a câmera da bancada fotografará cada amostra com iodo e
                        o MASH classificará a cor; a decisão de seguir para a fervura continuará
                        sendo sua.
                    </p>
                </div>
                <div className="acoes">
                    <button
                        type="button"
                        id="demoReiniciar"
                        className="btn-secundario"
                        onClick={reiniciar}
                    >
                        <i className="ph ph-arrow-counter-clockwise" aria-hidden="true" />
                        Reiniciar
                    </button>
                    <button
                        type="button"
                        id="demoIniciar"
                        className="btn-primario"
                        onClick={iniciar}
                        disabled={estado.fase === 'aoVivo'}
                    >
                        <i className="ph ph-play" aria-hidden="true" />
                        Iniciar teste
                    </button>
                </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_440px]">
                <section
                    className="card flex flex-col overflow-hidden"
                    aria-labelledby="tituloCamera"
                >
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-linha px-6 py-5">
                        <div className="flex flex-col gap-0.5">
                            <h2 id="tituloCamera" className="text-lg font-semibold">
                                Lote 12/03 · American Pale Ale
                            </h2>
                            <p className="text-sm text-texto-2">
                                Rampa 2 de 3 · 66 ºC · mosturação há{' '}
                                <span id="demoTempo">
                                    {relogio(estado.coletas ? 30 + (estado.coletas - 1) * 10 : 20)}
                                </span>
                            </p>
                        </div>
                        <span id="demoAoVivo" className="selo-info">
                            {SELO[estado.fase]}
                        </span>
                    </div>

                    <div className="grid flex-1 gap-6 p-6 md:grid-cols-[260px_minmax(0,1fr)] md:items-center">
                        <div
                            className="relative mx-auto grid aspect-square w-full max-w-[260px] place-items-center rounded-2xl bg-mash-brown-dark"
                            aria-hidden="true"
                        >
                            <span className="absolute left-3 top-3 flex items-center gap-1.5 text-xs font-semibold text-header-texto-2">
                                <i className="ph-fill ph-camera" />
                                Câmera da bancada
                            </span>
                            <span
                                id="demoAmostra"
                                className="size-36 rounded-full shadow-[inset_0_-12px_24px_rgba(0,0,0,0.35)] transition-colors duration-700 motion-reduce:transition-none"
                                style={{ background: atual?.cor ?? '#b9b0a8' }}
                            />
                            {estado.lendo && (
                                <span
                                    id="demoLendo"
                                    className="absolute bottom-3 flex items-center gap-1.5 text-xs font-semibold text-white"
                                >
                                    <i className="ph ph-circle-notch animate-spin motion-reduce:animate-none" />
                                    Lendo a cor…
                                </span>
                            )}
                        </div>

                        <div className="flex flex-col gap-4" aria-live="polite">
                            <div className="flex flex-col gap-1">
                                <span className="text-sm text-texto-2">Leitura atual</span>
                                <p
                                    id="demoResultado"
                                    className="font-display text-[28px] font-semibold"
                                >
                                    {atual?.resultado ?? 'Nenhuma coleta ainda'}
                                </p>
                                <p id="demoDescricao" className="text-texto-2">
                                    {atual?.descricao ??
                                        'Inicie o teste para ver as coletas acontecendo.'}
                                </p>
                            </div>
                            <div>
                                <div className="mb-2 flex justify-between text-xs font-semibold text-texto-2">
                                    <span>Amido presente</span>
                                    <span>Sem amido</span>
                                </div>
                                <div className="relative h-3 rounded-full bg-linear-to-r from-[#2b1a3d] via-[#9c3d1e] to-[#e9b949]">
                                    {atual && (
                                        <span
                                            id="demoMarcador"
                                            className="absolute -top-1.5 size-6 -translate-x-1/2 rounded-full border-4 border-superficie bg-texto shadow transition-[left] duration-700 motion-reduce:transition-none"
                                            style={{ left: `${atual.posicao}%` }}
                                        />
                                    )}
                                </div>
                            </div>
                            {estado.fase === 'concluido' && (
                                <div
                                    id="demoPronto"
                                    className="flex items-center gap-3 rounded-[10px] bg-sucesso-suave px-4 py-3"
                                >
                                    <i
                                        className="ph-fill ph-check-circle text-[22px] text-sucesso"
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
                    </div>
                </section>

                <section
                    className="card self-start overflow-hidden"
                    aria-labelledby="tituloColetas"
                >
                    <div className="flex flex-col gap-0.5 border-b border-linha px-6 py-5">
                        <h2 id="tituloColetas" className="text-lg font-semibold">
                            Coletas deste lote
                        </h2>
                        <p className="text-sm text-texto-2">
                            Uma coleta a cada 10 minutos, até 6 testes.
                        </p>
                    </div>
                    <ol id="demoColetas" className="flex flex-col px-6 py-2">
                        {!feitas.length && (
                            <li className="py-6 text-center text-sm text-texto-2">
                                As coletas aparecem aqui.
                            </li>
                        )}
                        {feitas.map((coleta) => (
                            <li
                                key={coleta.hora}
                                className="tabela-linha flex items-center gap-3 py-3.5"
                            >
                                <span
                                    className="size-7 shrink-0 rounded-md"
                                    style={{ background: coleta.cor }}
                                />
                                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                                    <span className="font-semibold">{coleta.resultado}</span>
                                    <span className="text-[13px] text-texto-2">
                                        {coleta.detalhe}
                                    </span>
                                </span>
                                <span className="text-sm font-medium">{coleta.hora}</span>
                            </li>
                        ))}
                    </ol>
                </section>
            </div>
        </>
    );
}

export default function IodineDemoContent() {
    return (
        <AppShell title="Teste de iodo" trail={['Teste de iodo', 'Nova análise']}>
            <Demo />
        </AppShell>
    );
}
