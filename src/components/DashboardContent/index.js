import AppShell from '@/components/AppShell';
import Link from 'next/link';
import { EmptyState } from '@/components/Feedback';

// A API ainda não tem leituras, alertas, lotes nem dispositivo: cada área mostra o estado vazio.
const INDICADORES = [
    [
        'Temperatura atual',
        'Temperatura',
        'ph-thermometer-simple',
        'Sem leitura do sensor',
        'Sem leitura',
    ],
    ['Lote ativo', 'Lote ativo', 'ph-cube', 'Nenhum lote em andamento', 'Nenhum'],
    ['Alertas (24 h)', 'Alertas (24 h)', 'ph-bell-simple', 'Sem alertas registrados', 'Nenhum'],
    ['Teste de iodo', 'Iodo', 'ph-test-tube', 'Nenhuma sessão aberta', 'Sem sessão'],
];

export default function DashboardContent() {
    return (
        <AppShell title="Painel" trail={['Painel', 'Visão geral']}>
            <h1 className="text-[30px] font-semibold max-lg:sr-only">Painel</h1>
            <section
                className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4"
                aria-label="Indicadores"
            >
                {INDICADORES.map(([rotulo, curto, icone, detalhe, detalheCurto]) => (
                    <div key={rotulo} className="card flex flex-col gap-1.5 p-3.5 sm:p-5">
                        <span className="flex items-center justify-between gap-2 text-sm text-texto-2">
                            <span>
                                <span className="sm:hidden">{curto}</span>
                                <span className="max-sm:hidden">{rotulo}</span>
                            </span>
                            <i className={`ph ${icone} text-xl`} aria-hidden="true" />
                        </span>
                        <span
                            className="font-display text-[30px] font-semibold"
                            aria-label="Sem dado"
                        >
                            —
                        </span>
                        <span className="text-[13px] text-texto-2">
                            <span className="sm:hidden">{detalheCurto}</span>
                            <span className="max-sm:hidden">{detalhe}</span>
                        </span>
                    </div>
                ))}
            </section>
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_440px]">
                <section className="card overflow-hidden" aria-labelledby="tituloTemperatura">
                    <div className="flex flex-col gap-0.5 border-b border-linha px-6 py-5">
                        <h2 id="tituloTemperatura" className="text-lg font-semibold">
                            <span className="sm:hidden">Temperatura</span>
                            <span className="max-sm:hidden">Análise de temperatura</span>
                        </h2>
                        <p className="text-sm text-texto-2 max-sm:hidden">
                            Última hora do lote em andamento.
                        </p>
                    </div>
                    <EmptyState
                        icon="ph-chart-line"
                        title="Sem leituras de temperatura"
                        text="O gráfico aparece quando um lote estiver em andamento com o sensor ligado."
                    />
                </section>
                <section className="card overflow-hidden" aria-labelledby="tituloAlertas">
                    <h2
                        id="tituloAlertas"
                        className="border-b border-linha px-6 py-5 text-lg font-semibold"
                    >
                        Alertas recentes
                    </h2>
                    <EmptyState
                        icon="ph-bell-simple"
                        title="Nenhum alerta"
                        text="Temperatura fora da faixa e avisos do teste de iodo aparecem aqui."
                    />
                </section>
            </div>
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_440px]">
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
                    <EmptyState
                        icon="ph-cube"
                        title="Nenhum lote ainda"
                        compact
                        action={{ href: '/lots/new', icon: 'ph-plus', text: 'Novo lote' }}
                    />
                </section>
                <section className="card overflow-hidden" aria-labelledby="tituloControles">
                    <h2
                        id="tituloControles"
                        className="border-b border-linha px-6 py-5 text-lg font-semibold"
                    >
                        Controles ativos
                    </h2>
                    <EmptyState
                        icon="ph-plugs"
                        title="Nenhum dispositivo conectado"
                        text="Controle térmico e câmera da bancada aparecem quando estiverem ligados ao MASH."
                        compact
                    />
                </section>
            </div>
        </AppShell>
    );
}
