import Link from 'next/link';
import AppShell from '@/components/AppShell';

// Dados de exemplo para preencher o painel (decisão de 28/10/2026); trocar pela resposta da API na conloq/mash#104.
// Coerentes com a simulação do teste de iodo: Lote 12/03, American Pale Ale, rampa 2 a 66 ºC.
const INDICADORES = [
    {
        rotulo: 'Temperatura atual',
        curto: 'Temperatura',
        icone: 'ph-thermometer-simple',
        valor: '66,4 ºC',
        detalhe: 'Rampa 2 · faixa 64 – 68 ºC',
        detalheCurto: 'Rampa 2',
    },
    {
        rotulo: 'Lote ativo',
        curto: 'Lote ativo',
        icone: 'ph-cube',
        valor: '12/03',
        detalhe: 'American Pale Ale · há 50 min',
        detalheCurto: 'APA · 50 min',
    },
    {
        rotulo: 'Alertas (24 h)',
        curto: 'Alertas (24 h)',
        icone: 'ph-bell-simple',
        valor: '2',
        detalhe: '1 de temperatura, 1 do iodo',
        detalheCurto: '2 avisos',
        cor: 'font-semibold text-aviso',
    },
    {
        rotulo: 'Teste de iodo',
        curto: 'Iodo',
        icone: 'ph-test-tube',
        valor: 'Coleta 3',
        detalhe: 'Conversão parcial · próxima em 10 min',
        detalheCurto: 'Parcial',
        cor: 'font-semibold text-sucesso',
    },
];

// Uma leitura a cada 5 minutos na última hora (ºC)
const LEITURAS = [52.1, 55.8, 59.6, 62.9, 64.7, 65.8, 66.3, 68.9, 67.4, 66.1, 65.9, 66.2, 66.4];
const PISO = 50;
const TETO = 72;
const GRADE = [0, 25, 50, 75, 100];
const HORARIOS = ['14:00', '14:10', '14:20', '14:30', '14:40', '14:50', '15:00'];

const ALERTAS = [
    {
        icone: 'ph-warning',
        cor: 'text-aviso',
        titulo: 'Temperatura acima da faixa',
        detalhe: 'Lote 12/03 passou de 68 ºC na rampa 2. Verifique o aquecimento.',
        quando: 'Há 25 minutos',
    },
    {
        icone: 'ph-info',
        cor: 'text-info',
        titulo: 'Teste de iodo: conversão parcial',
        detalhe: 'Lote 12/03 · coleta 3. Ainda há amido na amostra.',
        quando: 'Há 15 minutos',
    },
];

const LOTES = [
    ['Lote 12/03', 'American Pale Ale', '12/03/2026', ['selo-aviso', 'Em andamento']],
    ['Lote 05/03', 'Weiss', '05/03/2026', ['selo-sucesso', 'Concluído']],
    ['Lote 26/02', 'Stout', '26/02/2026', ['selo-sucesso', 'Concluído']],
];

const CONTROLES = [
    ['ph-thermometer-simple', 'Controle térmico', 'Automático · alvo 66 ºC', true],
    ['ph-test-tube', 'Automação do iodo', 'Dosagem', false],
];

const y = (t) => ((TETO - t) / (TETO - PISO)) * 100;

function GraficoTemperatura() {
    const x = (i) => (i / (LEITURAS.length - 1)) * 100;
    // curva suave: controles no meio de cada intervalo
    const linha = LEITURAS.map((t, i) => {
        if (!i) return `M0,${y(t)}`;
        const meio = (x(i - 1) + x(i)) / 2;
        return `C${meio},${y(LEITURAS[i - 1])} ${meio},${y(t)} ${x(i)},${y(t)}`;
    }).join(' ');
    return (
        <div className="flex flex-col gap-2.5 px-6 py-5">
            <svg
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                className="h-56 w-full"
                role="img"
                aria-label="Temperatura da última hora: subiu de 52 para 66 ºC, passou de 68 ºC às 14:35 e voltou para a faixa de 64 a 68 ºC."
            >
                {GRADE.map((g) => (
                    <line
                        key={g}
                        x1="0"
                        x2="100"
                        y1={g}
                        y2={g}
                        className="stroke-linha"
                        vectorEffect="non-scaling-stroke"
                    />
                ))}
                <path
                    d={linha}
                    fill="none"
                    className="stroke-acao"
                    strokeWidth="2.5"
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                />
            </svg>
            <div
                className="flex justify-between text-xs tabular-nums text-texto-2"
                aria-hidden="true"
            >
                {HORARIOS.map((h) => (
                    <span key={h}>{h}</span>
                ))}
            </div>
        </div>
    );
}

export default function DashboardContent() {
    return (
        <AppShell title="Painel" trail={['Painel', 'Visão geral']}>
            <h1 className="text-[30px] font-semibold max-lg:sr-only">Painel</h1>
            <section
                className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4"
                aria-label="Indicadores"
            >
                {INDICADORES.map((item) => (
                    <div key={item.rotulo} className="card flex flex-col gap-1.5 p-3.5 sm:p-5">
                        <span className="flex items-center justify-between gap-2 text-sm text-texto-2">
                            <span>
                                <span className="sm:hidden">{item.curto}</span>
                                <span className="max-sm:hidden">{item.rotulo}</span>
                            </span>
                            <i className={`ph ${item.icone} text-xl`} aria-hidden="true" />
                        </span>
                        <span className="truncate font-display text-[26px] font-semibold sm:text-[30px]">
                            {item.valor}
                        </span>
                        <span className={`text-[13px] ${item.cor ?? 'text-texto-2'}`}>
                            <span className="sm:hidden">{item.detalheCurto}</span>
                            <span className="max-sm:hidden">{item.detalhe}</span>
                        </span>
                    </div>
                ))}
            </section>
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_440px] xl:items-start">
                <section className="card overflow-hidden" aria-labelledby="tituloTemperatura">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-linha px-6 py-5">
                        <div className="flex flex-col gap-0.5">
                            <h2 id="tituloTemperatura" className="text-lg font-semibold">
                                <span className="sm:hidden">Temperatura</span>
                                <span className="max-sm:hidden">Análise de temperatura</span>
                            </h2>
                            <p className="text-sm text-texto-2 max-sm:hidden">
                                Última hora · Lote 12/03
                            </p>
                        </div>
                        <span className="selo-sucesso">Ao vivo</span>
                    </div>
                    <GraficoTemperatura />
                </section>
                <section className="card overflow-hidden" aria-labelledby="tituloAlertas">
                    <h2
                        id="tituloAlertas"
                        className="border-b border-linha px-6 py-5 text-lg font-semibold"
                    >
                        Alertas recentes
                    </h2>
                    <ul className="flex flex-col px-6 py-2">
                        {ALERTAS.map((alerta) => (
                            <li
                                key={alerta.titulo}
                                className="flex items-start gap-3 border-b border-linha py-3.5 last:border-b-0"
                            >
                                <i
                                    className={`ph-fill ${alerta.icone} text-xl ${alerta.cor}`}
                                    aria-hidden="true"
                                />
                                <span className="flex min-w-0 flex-1 flex-col gap-0.5 text-texto-2">
                                    <span className="text-sm font-semibold text-texto">
                                        {alerta.titulo}
                                    </span>
                                    <span className="text-[13px] leading-[18px]">
                                        {alerta.detalhe}
                                    </span>
                                    <span className="text-xs">{alerta.quando}</span>
                                </span>
                            </li>
                        ))}
                    </ul>
                </section>
            </div>
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_440px] xl:items-start">
                <section
                    className="card overflow-hidden max-sm:hidden"
                    aria-labelledby="tituloLotesRecentes"
                >
                    <div className="flex items-center justify-between border-b border-linha px-6 py-5">
                        <h2 id="tituloLotesRecentes" className="text-lg font-semibold">
                            Lotes recentes
                        </h2>
                        <Link href="/lots" className="font-semibold text-acao hover:underline">
                            Ver todos
                        </Link>
                    </div>
                    <div
                        className="tabela-cabecalho grid min-h-11 grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)_130px_110px] min-[1760px]:grid-cols-[160px_minmax(0,1fr)_200px_180px] items-center gap-4 px-6"
                        aria-hidden="true"
                    >
                        <span>Lote</span>
                        <span>Receita</span>
                        <span>Status</span>
                        <span>Início</span>
                    </div>
                    {LOTES.map(([nome, receita, inicio, [selo, status]]) => (
                        <div
                            key={nome}
                            className="tabela-linha grid min-h-14 grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)_130px_110px] min-[1760px]:grid-cols-[160px_minmax(0,1fr)_200px_180px] items-center gap-4 px-6"
                        >
                            <span className="truncate text-sm font-semibold">{nome}</span>
                            <span className="truncate text-sm">{receita}</span>
                            <span className={`${selo} justify-self-start`}>{status}</span>
                            <span className="text-sm tabular-nums">{inicio}</span>
                        </div>
                    ))}
                </section>
                <section className="card overflow-hidden" aria-labelledby="tituloControles">
                    <h2
                        id="tituloControles"
                        className="border-b border-linha px-6 py-5 text-lg font-semibold"
                    >
                        Controles ativos
                    </h2>
                    <ul className="flex flex-col px-6 py-2">
                        {CONTROLES.map(([icone, nome, detalhe, ligado]) => (
                            <li
                                key={nome}
                                className="flex items-center gap-3 border-b border-linha py-3.5 last:border-b-0"
                            >
                                <i
                                    className={`ph ${icone} text-[22px] text-texto-2`}
                                    aria-hidden="true"
                                />
                                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                                    <span className="text-sm font-semibold">{nome}</span>
                                    <span className="text-[13px] text-texto-2">{detalhe}</span>
                                </span>
                                {/* só mostra o estado do exemplo; sem rota para ligar ou desligar */}
                                <input
                                    type="checkbox"
                                    role="switch"
                                    className="interruptor cursor-default"
                                    checked={ligado}
                                    disabled
                                    readOnly
                                    aria-label={nome}
                                />
                            </li>
                        ))}
                    </ul>
                </section>
            </div>
        </AppShell>
    );
}
