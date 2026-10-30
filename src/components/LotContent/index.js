import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import AppShell from '@/components/AppShell';
import { ConfirmDialog, EmptyState, flash, ServerError } from '@/components/Feedback';
import { LotForm, SeloLote } from '@/components/LotsContent';
import { api, mensagemErro } from '@/services/api';

// Telas do lote: o lote e a receita vêm da API; leituras de iodo e de temperatura ainda não têm rota, ficam no estado vazio.

function Cabecalho({ id, titulo, descricao, children }) {
    return (
        <div className="flex flex-col gap-0.5 border-b border-linha px-6 py-5" id={id}>
            <h2 className="text-lg font-semibold">{titulo}</h2>
            {descricao && <p className="text-sm text-texto-2">{descricao}</p>}
            {children}
        </div>
    );
}

function VoltarLotes() {
    return (
        <Link href="/lots" className="btn-voltar self-start max-lg:hidden">
            <i className="ph ph-arrow-left" aria-hidden="true" />
            Todos os lotes
        </Link>
    );
}

function IniciarIodoMobile({ lote }) {
    return (
        <div className="barra-mobile lg:hidden">
            <Link href={`${lote}/iodine`} className="btn-primario w-full">
                <i className="ph ph-video-camera" aria-hidden="true" />
                Iniciar leitura do iodo
            </Link>
        </div>
    );
}

function CardTemperatura({ texto, compact }) {
    return (
        <section className="card overflow-hidden" aria-label="Temperatura">
            <Cabecalho titulo="Temperatura" descricao="Mosturação · leitura do sensor" />
            <EmptyState
                icon="ph-chart-line"
                title="Sem leituras de temperatura"
                text={texto}
                compact={compact}
            />
        </section>
    );
}

// Lote e a receita dele; receita null = não carregou
function useLote(id) {
    const [estado, setEstado] = useState({ lote: null, receita: null, erro: null });
    useEffect(() => {
        if (!id) return;
        api.get(`/lots/${id}`)
            .then(async ({ data }) => {
                const receita = await api
                    .get(`/recipes/${data.lot.recipeId}`)
                    .then((r) => r.data.recipe)
                    .catch(() => null);
                setEstado({ lote: data.lot, receita, erro: null });
            })
            .catch((error) =>
                setEstado({
                    lote: null,
                    receita: null,
                    erro: mensagemErro(error, 'Não foi possível carregar o lote.'),
                })
            );
    }, [id]);
    return estado;
}

export function LotDetail({ editando = false }) {
    const router = useRouter();
    const lote = `/lots/${router.query.id}`;
    const { lote: dados, receita, erro } = useLote(router.query.id);
    const [confirmacao, setConfirmacao] = useState(null);

    const excluir = async () => {
        try {
            await api.delete(lote);
            flash('success', 'Lote excluído.');
            router.push('/lots');
        } catch (error) {
            flash('danger', mensagemErro(error, 'Não foi possível excluir o lote.'));
        }
    };

    return (
        <AppShell
            title={dados?.name ?? 'Lote'}
            trail={['Lotes', dados?.name ?? 'Lote']}
            back="/lots"
        >
            {erro && <ServerError message={erro} />}
            {!erro && !dados && (
                <div className="esqueleto h-40 rounded-xl" aria-label="Carregando" />
            )}
            {dados && (
                <>
                    <div className="flex flex-col gap-2">
                        <VoltarLotes />
                        <div className="flex flex-wrap items-end justify-between gap-4">
                            <div className="flex min-w-0 flex-wrap items-center gap-3">
                                <h1 className="truncate text-[30px] font-semibold max-lg:sr-only">
                                    {dados.name}
                                </h1>
                                <SeloLote status={dados.status} />
                            </div>
                            <div className="acoes">
                                <button
                                    type="button"
                                    id="btnExcluir"
                                    className="btn-perigo max-lg:order-1"
                                    onClick={() =>
                                        setConfirmacao({
                                            titulo: `Excluir o lote ${dados.name}?`,
                                            mensagem: 'Não dá para desfazer.',
                                            botao: 'Excluir lote',
                                            aoConfirmar: excluir,
                                        })
                                    }
                                >
                                    <i className="ph ph-trash" aria-hidden="true" />
                                    Excluir
                                </button>
                                <Link href={`${lote}/edit`} className="btn-secundario">
                                    <i className="ph ph-pencil-simple" aria-hidden="true" />
                                    Editar
                                </Link>
                                <Link
                                    href={`${lote}/monitoring`}
                                    className="btn-secundario max-lg:order-2 max-lg:col-span-2"
                                >
                                    <i className="ph ph-chart-line" aria-hidden="true" />
                                    <span className="lg:hidden">Ver monitoramento</span>
                                    <span className="max-lg:hidden">Monitoramento</span>
                                </Link>
                                <Link
                                    href={`${lote}/iodine`}
                                    className="btn-primario max-lg:hidden"
                                >
                                    <i className="ph ph-video-camera" aria-hidden="true" />
                                    Iniciar leitura do iodo
                                </Link>
                            </div>
                        </div>
                    </div>
                    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px] xl:items-start">
                        <section className="card overflow-hidden" aria-label="Leituras do iodo">
                            <Cabecalho
                                titulo="Leituras do iodo"
                                descricao="Da coleta mais recente para a mais antiga."
                            />
                            <EmptyState
                                icon="ph-test-tube"
                                title="Nenhuma leitura neste lote"
                                text="Cada captura da câmera aparece aqui com hora, temperatura e classe."
                                compact
                            />
                        </section>
                        <section className="card overflow-hidden" aria-label="Receita do lote">
                            <Cabecalho titulo="Receita do lote" />
                            <dl className="flex flex-col px-6 py-2 text-sm">
                                <div className="flex justify-between gap-4 border-b border-linha py-3">
                                    <dt className="text-texto-2">Receita</dt>
                                    <dd className="font-semibold">
                                        {receita ? (
                                            <Link
                                                href={`/recipes/${receita.id}`}
                                                className="text-acao hover:underline"
                                            >
                                                {receita.name}
                                            </Link>
                                        ) : (
                                            '—'
                                        )}
                                    </dd>
                                </div>
                                <div className="flex justify-between gap-4 py-3">
                                    <dt className="text-texto-2">Início da mosturação</dt>
                                    <dd className="font-semibold">
                                        {new Date(dados.mashStart).toLocaleString('pt-BR', {
                                            dateStyle: 'short',
                                            timeStyle: 'short',
                                        })}
                                    </dd>
                                </div>
                            </dl>
                        </section>
                    </div>
                    <CardTemperatura texto="A curva da mosturação aparece quando o sensor enviar leituras deste lote." />
                    <IniciarIodoMobile lote={lote} />
                </>
            )}
            {editando && dados && (
                <LotForm
                    lote={dados}
                    onClose={() => router.push(lote)}
                    onSalvo={() => router.push(lote)}
                />
            )}
            <ConfirmDialog pedido={confirmacao} onClose={() => setConfirmacao(null)} />
        </AppShell>
    );
}

export function LotMonitoring() {
    const router = useRouter();
    const lote = `/lots/${router.query.id}`;
    return (
        <AppShell title="Monitoramento" trail={['Lotes', 'Monitoramento']} back={lote}>
            <div className="flex flex-col gap-2 max-lg:contents">
                <VoltarLotes />
                <div className="flex flex-wrap items-end justify-between gap-4 max-lg:contents">
                    <h1 className="text-[30px] font-semibold max-lg:sr-only">Monitoramento</h1>
                    <Link href={`${lote}/iodine`} className="btn-primario max-lg:hidden">
                        <i className="ph ph-video-camera" aria-hidden="true" />
                        Iniciar leitura do iodo
                    </Link>
                </div>
            </div>
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px] xl:items-start">
                <section className="card overflow-hidden" aria-label="Histórico de conversão">
                    <Cabecalho
                        titulo="Histórico de conversão"
                        descricao="Uma coleta por teste de iodo, da primeira à mais recente."
                    />
                    <EmptyState
                        icon="ph-test-tube"
                        title="Nenhuma coleta ainda"
                        text="Presença de amido, conversão parcial e ausência de amido aparecem aqui conforme a câmera classifica."
                    />
                </section>
                <section className="card overflow-hidden" aria-label="Registros">
                    <Cabecalho titulo="Registros" descricao="Linha do tempo das coletas" />
                    <EmptyState icon="ph-list-bullets" title="Sem registros" compact />
                </section>
            </div>
            <CardTemperatura compact />
            <IniciarIodoMobile lote={lote} />
        </AppShell>
    );
}

function SemCamera({ className, rotulo }) {
    return (
        <div
            className={`relative flex flex-1 flex-col items-center justify-center gap-3 bg-mash-brown-dark px-6 py-12 text-center ${className}`}
        >
            {rotulo && (
                <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-md bg-black/40 px-2 py-1 text-xs font-semibold text-white max-lg:hidden">
                    <i className="ph ph-video-camera" aria-hidden="true" />
                    Câmera da bancada
                </span>
            )}
            <i
                className="ph ph-video-camera-slash text-4xl text-header-texto-2"
                aria-hidden="true"
            />
            <p className="font-display text-xl font-semibold text-white">Sem imagem da câmera</p>
            <p className="max-w-sm text-sm text-header-texto-2">
                Confira o cabo USB e a energia da bancada. A imagem aparece aqui quando a câmera
                responder.
            </p>
        </div>
    );
}

const CALIBRACAO = [
    ['Padrão branco', 'Corrige o balanço de cor da câmera.'],
    ['Controle positivo', 'Esperado: violeta ou azul-escuro.'],
    ['Controle negativo', 'Esperado: amarelo ou âmbar.'],
];
const CONFIGURACAO = [
    ['ph-timer', 'Intervalo entre capturas'],
    ['ph-stack', 'Capturas no máximo'],
    ['ph-thermometer-simple', 'Começa na'],
];

function Preparar({ lote }) {
    return (
        <>
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_440px]">
                <section
                    className="card flex flex-col overflow-hidden"
                    aria-label="Câmera da bancada"
                >
                    <SemCamera className="min-h-72 lg:min-h-[480px]" />
                    <div className="flex flex-wrap items-center gap-4 border-t border-linha px-6 py-4">
                        <div className="flex flex-1 flex-col gap-0.5">
                            <p className="font-semibold max-lg:hidden">Câmera desligada</p>
                            <p className="text-sm text-texto-2">
                                Com a câmera ligada, a calibração começa pelo padrão branco.
                            </p>
                        </div>
                        <button type="button" className="btn-primario max-lg:hidden" disabled>
                            <i className="ph ph-camera" aria-hidden="true" />
                            Capturar padrão branco
                        </button>
                    </div>
                </section>
                <div className="flex flex-col gap-4">
                    <section
                        className="card flex flex-col gap-3 p-5 max-lg:border-0 max-lg:bg-transparent max-lg:p-0"
                        aria-labelledby="tituloCalibracao"
                    >
                        <h2 id="tituloCalibracao" className="text-lg font-semibold">
                            Calibração da sessão
                        </h2>
                        <p className="text-sm leading-relaxed text-texto-2 max-lg:hidden">
                            A luz muda de um dia para outro. Os controles desta sessão definem onde
                            fica cada classe.
                        </p>
                        <ol className="flex flex-col gap-2.5">
                            {CALIBRACAO.map(([nome, detalhe]) => (
                                <li
                                    key={nome}
                                    className="flex items-center gap-3.5 rounded-xl border border-linha bg-superficie px-4 py-3"
                                >
                                    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-fundo">
                                        <i
                                            className="ph ph-circle text-texto-2"
                                            aria-hidden="true"
                                        />
                                    </span>
                                    <span className="flex flex-col">
                                        <span className="font-semibold">{nome}</span>
                                        <span className="text-[13px] text-texto-2">{detalhe}</span>
                                    </span>
                                    <span className="sr-only">Pendente</span>
                                </li>
                            ))}
                        </ol>
                    </section>
                    <section
                        className="card flex flex-col px-5 py-2 max-lg:hidden"
                        aria-label="Configuração da sessão"
                    >
                        <dl className="flex flex-col">
                            {CONFIGURACAO.map(([icone, rotulo]) => (
                                <div
                                    key={rotulo}
                                    className="flex items-center gap-3 border-b border-linha py-3 text-sm"
                                >
                                    <i
                                        className={`ph ${icone} text-lg text-texto-2`}
                                        aria-hidden="true"
                                    />
                                    <dt className="flex-1 text-texto-2">{rotulo}</dt>
                                    <dd className="font-semibold">—</dd>
                                </div>
                            ))}
                        </dl>
                        <Link
                            href="/recipes"
                            className="py-3 text-sm font-semibold text-acao hover:underline"
                        >
                            Alterar na receita
                        </Link>
                    </section>
                    <section
                        className="card flex flex-col gap-3 p-5 max-lg:hidden"
                        aria-labelledby="tituloEscala"
                    >
                        <h2 id="tituloEscala" className="text-lg font-semibold">
                            Escala desta sessão
                        </h2>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                ['Controle positivo', 'Pendente'],
                                ['Controle negativo', 'Depois do positivo'],
                            ].map(([nome, estado]) => (
                                <div
                                    key={nome}
                                    className="flex items-center gap-2.5 rounded-[10px] bg-fundo p-2.5"
                                >
                                    <span
                                        className="size-8 shrink-0 rounded-md border border-linha bg-superficie"
                                        aria-hidden="true"
                                    />
                                    <span className="flex flex-col">
                                        <span className="text-[13px] font-semibold">{nome}</span>
                                        <span className="text-xs text-texto-2">{estado}</span>
                                    </span>
                                </div>
                            ))}
                        </div>
                        <p className="text-[13px] leading-relaxed text-texto-2">
                            Cada captura é comparada com essas duas cores. Perto do positivo, ainda
                            há amido; perto do negativo, a conversão terminou. O que fica no meio é
                            conversão parcial.
                        </p>
                    </section>
                </div>
            </div>
            <div className="sticky bottom-0 -mx-4 mt-auto flex flex-wrap items-center gap-3 border-t border-linha bg-superficie px-4 py-4 sm:-mx-6 sm:px-6 lg:-mx-10 lg:-mb-8 lg:px-10">
                <p className="text-sm text-texto-2 max-lg:hidden lg:ml-auto">
                    Faltam 3 etapas da calibração
                </p>
                <div className="acoes max-lg:hidden">
                    <Link href={lote} className="btn-secundario">
                        Cancelar
                    </Link>
                    <button type="button" className="btn-primario" disabled>
                        <i className="ph ph-play" aria-hidden="true" />
                        Iniciar leitura automática
                    </button>
                </div>
                <button type="button" className="btn-primario w-full lg:hidden" disabled>
                    <i className="ph ph-camera" aria-hidden="true" />
                    Capturar padrão branco
                </button>
            </div>
        </>
    );
}

const CLASSES = [
    ['#2b1a3d', 'Presença de amido'],
    ['#9c3d1e', 'Conversão parcial'],
    ['#e9b949', 'Ausência de amido'],
];

function Leitura({ lote }) {
    return (
        <>
            <div
                className="flex items-start gap-3 rounded-[10px] bg-perigo-suave px-4 py-3"
                role="status"
            >
                <i className="ph-fill ph-x-circle text-[22px] text-perigo" aria-hidden="true" />
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <p className="font-semibold">A câmera não está respondendo</p>
                    <p className="text-sm">
                        As capturas anteriores continuam salvas no lote. Nenhuma classe nova é
                        registrada até a câmera voltar.
                    </p>
                </div>
            </div>
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_440px] xl:items-start">
                <section
                    className="card grid overflow-hidden lg:grid-cols-2"
                    aria-label="Câmera da bancada"
                >
                    <SemCamera className="min-h-64" rotulo />
                    <div className="flex flex-col gap-2 px-6 py-5">
                        <span className="text-sm text-texto-2">Última captura</span>
                        <p className="font-display text-[26px] font-semibold">
                            Nenhuma captura ainda
                        </p>
                        <p className="text-sm text-texto-2">
                            A classe da primeira captura aparece aqui, entre o controle positivo e o
                            negativo.
                        </p>
                    </div>
                </section>
                <section className="card overflow-hidden" aria-label="Capturas da sessão">
                    <Cabecalho
                        titulo="Capturas da sessão"
                        descricao="Da mais recente para a mais antiga."
                    />
                    <EmptyState
                        icon="ph-camera"
                        title="Nenhuma captura"
                        text="Uma captura inconclusiva por reflexo ou foco é repetida sozinha e não conta."
                        compact
                    />
                </section>
            </div>
            <section className="card overflow-hidden" aria-label="Temperatura e capturas">
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-linha px-6 py-5">
                    <div className="flex flex-col gap-0.5">
                        <h2 className="text-lg font-semibold">Temperatura e capturas</h2>
                        <p className="text-sm text-texto-2">
                            Cada ponto é uma captura, na cor da classe, sobre a curva da mosturação.
                        </p>
                    </div>
                    <ul className="flex flex-wrap gap-4 text-[13px] text-texto-2 max-lg:hidden">
                        {CLASSES.map(([cor, nome]) => (
                            <li key={nome} className="flex items-center gap-1.5">
                                <span
                                    className="size-2.5 rounded-full"
                                    style={{ background: cor }}
                                    aria-hidden="true"
                                />
                                {nome}
                            </li>
                        ))}
                    </ul>
                </div>
                <EmptyState icon="ph-chart-line" title="Sem leituras" compact />
            </section>
            <div className="acoes barra-mobile lg:hidden">
                <Link href={`${lote}/monitoring`} className="btn-secundario">
                    <i className="ph ph-stop" aria-hidden="true" />
                    Encerrar
                </Link>
                <Link href={`${lote}/iodine/reading`} className="btn-primario">
                    <i className="ph ph-arrow-clockwise" aria-hidden="true" />
                    Reconectar
                </Link>
            </div>
        </>
    );
}

// Sessão do iodo do lote: sem câmera nem rota na API, mostra câmera desconectada e calibração pendente.
export function IodineSession({ leitura = false }) {
    const router = useRouter();
    const lote = `/lots/${router.query.id}`;
    const titulo = leitura ? 'Leitura automática' : 'Preparar a leitura do iodo';
    return (
        <AppShell
            title={leitura ? 'Leitura do iodo' : 'Preparar leitura'}
            trail={['Teste de iodo', leitura ? 'Leitura automática' : 'Preparar sessão']}
            back={lote}
        >
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div className="flex min-w-0 flex-col gap-1.5">
                    <div className="flex flex-wrap items-center gap-3">
                        <h1 className="text-[30px] font-semibold max-lg:sr-only">{titulo}</h1>
                        <span className="selo-perigo">Câmera desconectada</span>
                    </div>
                    <p className="text-texto-2 max-lg:text-sm">
                        {leitura
                            ? 'Cada captura é classificada sozinha e registrada no lote com hora e temperatura.'
                            : 'A câmera fica fixa na bancada e as configurações travam até o fim da sessão.'}
                    </p>
                </div>
                {leitura && (
                    <div className="acoes max-lg:hidden">
                        <Link href={`${lote}/monitoring`} className="btn-secundario">
                            <i className="ph ph-stop" aria-hidden="true" />
                            Encerrar leitura
                        </Link>
                        <Link href={`${lote}/iodine/reading`} className="btn-primario">
                            <i className="ph ph-arrow-clockwise" aria-hidden="true" />
                            Tentar reconectar
                        </Link>
                    </div>
                )}
            </div>
            {leitura ? <Leitura lote={lote} /> : <Preparar lote={lote} />}
        </AppShell>
    );
}
