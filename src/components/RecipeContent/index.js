import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
    ConfirmDialog,
    dataBr,
    EmptyState,
    flash,
    plural,
    ServerError,
} from '@/components/Feedback';
import { SeloLote } from '@/components/LotsContent';
import { pedidoExcluirReceita, RecipeNameModal } from '@/components/RecipesContent';
import { api, mensagemErro } from '@/services/api';
import { getAxiosConfig } from '@/services/auth';

// Detalhe e rampas em paralelo; rampas null = falhou. erro só quando a receita não carrega.
export function useReceita() {
    const router = useRouter();
    const id = router.query.id;
    const [estado, setEstado] = useState({ recipe: null, rampas: null, erro: null });

    const carregar = useCallback(async () => {
        if (!id) return;
        const [detalhe, rampas] = await Promise.allSettled([
            api.get(`/recipes/${id}`, getAxiosConfig()),
            api.get(`/recipes/${id}/temperatures`, getAxiosConfig()),
        ]);
        if (detalhe.status === 'rejected' || !detalhe.value.data.recipe) {
            return setEstado({
                recipe: null,
                rampas: null,
                erro: mensagemErro(detalhe.reason ?? {}, 'Não foi possível carregar a receita.'),
            });
        }
        setEstado({
            recipe: detalhe.value.data.recipe,
            rampas: rampas.status === 'fulfilled' ? (rampas.value.data.temperatures ?? []) : null,
            erro: null,
        });
    }, [id]);

    useEffect(() => {
        carregar();
    }, [carregar]);

    return { id, ...estado, carregar };
}

// "HH:MM:SS" em minutos; NaN quando o formato não bate
// Início da mosturação do lote, como no Figma: "12/03/2026 · 14:05"
const inicioLote = (iso) => {
    if (!iso) return 'Sem início registrado';
    const data = new Date(iso);
    const hora = data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    return `${data.toLocaleDateString('pt-BR')} · ${hora}`;
};

export const minutos = (hms) => {
    const [h, m, seg] = String(hms ?? '')
        .split(':')
        .map(Number);
    return h * 60 + m + seg / 60;
};

const pct = (v) => `${v * 100}%`;

// Perfil das rampas: cada faixa ocupa do início do timer até o fim, na altura da temperatura
function PerfilRampas({ rampas }) {
    const faixas = rampas
        .map((t, i) => ({ t, i, ini: minutos(t.initialization), dur: minutos(t.timer) }))
        .filter((f) => Number.isFinite(f.ini) && f.dur > 0);
    if (!faixas.length) return null;

    const fim = Math.max(...faixas.map((f) => f.ini + f.dur));
    // eixo do tempo em passos de 15 min, até 6 intervalos
    const passo = [15, 30, 60, 120].find((p) => fim / p <= 6) ?? Math.ceil(fim / 6 / 60) * 60;
    const total = Math.ceil(fim / passo) * passo;
    const piso = Math.floor(Math.min(...faixas.map((f) => f.t.minTemperatureLimit)) / 10) * 10;
    // folga em cima para o rótulo da rampa mais quente
    const teto = Math.ceil((Math.max(...faixas.map((f) => f.t.maxTemperatureLimit)) + 3) / 10) * 10;
    const graus = Array.from({ length: (teto - piso) / 10 + 1 }, (_, i) => teto - i * 10);
    const tempos = Array.from({ length: total / passo + 1 }, (_, i) => i * passo);

    return (
        <section
            id="rampProfile"
            className="card flex flex-col overflow-hidden"
            aria-labelledby="profileTitle"
        >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-6 py-5">
                <div className="flex flex-col gap-0.5">
                    <h2 id="profileTitle" className="text-lg font-semibold">
                        Perfil das rampas
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Faixa de cada rampa ao longo da mosturação, com os limites de alerta.
                    </p>
                </div>
                <div className="flex gap-5 text-[13px] text-muted-foreground" aria-hidden="true">
                    <span className="flex items-center gap-2">
                        <span className="h-3 w-4 rounded-[3px] border border-action/40 bg-action/25" />
                        Faixa da rampa
                    </span>
                    <span className="flex items-center gap-2">
                        <span className="h-3 w-4 rounded-[3px] border border-action/40 bg-action/10" />
                        Limites
                    </span>
                </div>
            </div>
            <div className="flex gap-3 px-6 pb-4 pt-5">
                <div
                    className="flex flex-col justify-between pb-6 text-xs tabular-nums text-muted-foreground"
                    aria-hidden="true"
                >
                    {graus.map((g) => (
                        <span key={g}>{g} ºC</span>
                    ))}
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <div
                        id="rampProfileChart"
                        className="relative h-80"
                        role="img"
                        aria-label={`${plural(faixas.length, 'rampa', 'rampas')} entre ${piso} e ${teto} ºC em ${Math.round(fim)} minutos. Os valores estão na tabela acima.`}
                    >
                        {graus.map((g) => (
                            <div
                                key={g}
                                className="absolute inset-x-0 h-px bg-border"
                                style={{ top: pct((teto - g) / (teto - piso)) }}
                            />
                        ))}
                        {faixas.map(({ t, i, ini, dur }) => {
                            const limite = Math.max(
                                t.maxTemperatureLimit - t.minTemperatureLimit,
                                1
                            );
                            return (
                                <div
                                    key={t.id ?? i}
                                    className="absolute border-r-2 border-surface bg-action/10"
                                    style={{
                                        left: pct(ini / total),
                                        width: pct(dur / total),
                                        top: pct((teto - t.maxTemperatureLimit) / (teto - piso)),
                                        height: pct(limite / (teto - piso)),
                                    }}
                                >
                                    <div
                                        className="absolute inset-x-0 border-t-2 border-action bg-action/25"
                                        style={{
                                            top: pct(
                                                (t.maxTemperatureLimit - t.maxTemperatureRamp) /
                                                    limite
                                            ),
                                            height: pct(
                                                (t.maxTemperatureRamp - t.minTemperatureRamp) /
                                                    limite
                                            ),
                                        }}
                                    />
                                    {/* rótulo alinhado à direita nas rampas do fim, para não sair do gráfico */}
                                    <span
                                        className={`absolute bottom-full mb-1 flex flex-col whitespace-nowrap text-xs leading-tight ${ini / total > 0.6 ? 'right-0' : 'left-1'}`}
                                    >
                                        <span className="font-semibold">
                                            Rampa {t.orderRamp ?? i + 1}
                                        </span>
                                        <span className="text-muted-foreground">
                                            {t.minTemperatureRamp} – {t.maxTemperatureRamp} ºC ·{' '}
                                            {Math.round(dur)} min
                                        </span>
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                    <div
                        className="flex justify-between text-xs tabular-nums text-muted-foreground"
                        aria-hidden="true"
                    >
                        {tempos.map((m) => (
                            <span key={m}>{m} min</span>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

function LinhaRampa({ rampa, ordem, recipeId, onExcluir }) {
    const celula = (rotulo, valor, coluna) => (
        <span
            className={`max-lg:col-span-3 max-lg:flex max-lg:justify-between max-lg:text-sm ${coluna} lg:row-start-1`}
        >
            <span className="text-muted-foreground lg:hidden">{rotulo}</span>
            <span>{valor}</span>
        </span>
    );
    return (
        <div className="list-row grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1.5 px-6 py-4 max-lg:mb-3 max-lg:rounded-xl max-lg:border max-lg:bg-surface max-lg:px-4 max-lg:pb-4 max-lg:pt-3 lg:min-h-[68px] lg:grid-cols-[56px_minmax(0,1fr)_150px_130px_140px_130px_96px] lg:gap-x-4 lg:py-0">
            <span className="grid size-8 place-items-center rounded-full bg-background font-display text-[13px] font-semibold">
                {ordem}
            </span>
            <span className="font-semibold max-lg:text-[17px]">
                {rampa.minTemperatureRamp} – {rampa.maxTemperatureRamp} ºC
            </span>
            <span className="flex gap-1 max-lg:col-start-3 max-lg:row-start-1 lg:col-start-7 lg:justify-end">
                <Link
                    href={`/recipes/${recipeId}/temperatures/${rampa.id}/edit`}
                    className="btn-icon"
                    aria-label={`Editar rampa ${ordem}`}
                >
                    <i className="ph ph-pencil-simple" aria-hidden="true" />
                </Link>
                <button
                    type="button"
                    className="btn-icon-danger"
                    onClick={onExcluir}
                    aria-label={`Excluir rampa ${ordem}`}
                >
                    <i className="ph ph-trash" aria-hidden="true" />
                </button>
            </span>
            {celula(
                'Limites',
                `${rampa.minTemperatureLimit} – ${rampa.maxTemperatureLimit} ºC`,
                'lg:col-start-3 lg:text-muted-foreground'
            )}
            {celula('Temporizador', rampa.timer, 'lg:col-start-4')}
            {celula('Início do timer', rampa.initialization, 'lg:col-start-5')}
            {celula('Tempo ideal', rampa.idealTime, 'lg:col-start-6')}
        </div>
    );
}

export default function RecipeContent({ edit = false, onNome }) {
    const router = useRouter();
    const { id, recipe, rampas, erro, carregar } = useReceita();
    const [renomeando, setRenomeando] = useState(false);
    const [confirmacao, setConfirmacao] = useState(null);
    const [lotes, setLotes] = useState(null);

    useEffect(() => {
        if (!id) return;
        api.get('/lots', getAxiosConfig())
            .then(({ data }) =>
                setLotes((data.lots ?? []).filter((lote) => String(lote.recipeId) === id))
            )
            .catch(() => setLotes([]));
    }, [id]);

    useEffect(() => {
        if (recipe) onNome(recipe.name);
    }, [recipe, onNome]);

    useEffect(() => {
        if (edit || router.query.edit === '1') setRenomeando(true);
    }, [edit, router.query.edit]);

    if (erro) return <ServerError message={erro} />;
    if (!recipe) return <div className="skeleton h-40 rounded-xl" aria-label="Carregando" />;

    const fecharRenomear = () => {
        setRenomeando(false);
        if (edit) router.replace(`/recipes/${id}`);
    };

    const renomear = async (name) => {
        try {
            const { data } = await api.put(`/recipes/${id}`, { name }, getAxiosConfig());
            flash('success', data?.message ?? 'Receita atualizada com sucesso.');
            fecharRenomear();
            carregar();
        } catch (error) {
            flash('danger', mensagemErro(error, 'Não foi possível salvar os dados.'));
        }
    };

    const excluir = async () => {
        try {
            await api.delete(`/recipes/${id}`, getAxiosConfig());
            flash('success', 'Receita excluída.');
            router.push('/recipes');
        } catch (error) {
            flash('danger', mensagemErro(error, 'Não foi possível excluir a receita.'));
        }
    };

    const excluirRampa = async (rampaId) => {
        try {
            await api.delete(`/temperatures/${rampaId}`, getAxiosConfig());
            flash('success', 'Rampa excluída.');
            carregar();
        } catch (error) {
            flash('danger', mensagemErro(error, 'Não foi possível excluir a rampa.'));
        }
    };

    const resumo =
        rampas === null
            ? 'Não foi possível carregar as rampas'
            : `${rampas.length ? plural(rampas.length, 'rampa', 'rampas') : 'nenhuma rampa'} · criada em ${dataBr(recipe.createdAt)}`;
    const novaRampa = `/recipes/${id}/temperatures/new`;

    return (
        <>
            <div className="flex flex-col gap-2">
                <Link href="/recipes" className="btn-back self-start max-lg:hidden">
                    <i className="ph ph-arrow-left" aria-hidden="true" />
                    Todas as receitas
                </Link>
                <div className="flex flex-wrap items-end justify-between gap-4">
                    <div className="flex min-w-0 flex-col gap-1.5">
                        <h1
                            id="recipeName"
                            className="truncate text-[22px] font-semibold lg:text-[30px]"
                        >
                            {recipe.name}
                        </h1>
                        <p id="recipeSummary" className="text-muted-foreground">
                            {resumo}
                        </p>
                    </div>
                    <div className="actions">
                        <button
                            type="button"
                            id="btnDeleteRecipe"
                            className="btn-danger max-lg:order-1"
                            onClick={() =>
                                setConfirmacao(
                                    pedidoExcluirReceita(
                                        `Excluir a receita ${recipe.name}?`,
                                        excluir
                                    )
                                )
                            }
                        >
                            <i className="ph ph-trash" aria-hidden="true" />
                            Excluir
                        </button>
                        <button
                            type="button"
                            className="btn-secondary"
                            onClick={() => setRenomeando(true)}
                        >
                            <i className="ph ph-pencil-simple" aria-hidden="true" />
                            Renomear
                        </button>
                        <Link
                            id="newTemperatureLink"
                            href={novaRampa}
                            className="btn-primary max-lg:hidden"
                        >
                            <i className="ph ph-plus" aria-hidden="true" />
                            Adicionar rampa
                        </Link>
                    </div>
                </div>
            </div>

            {/* lado a lado só quando as colunas fixas da tabela (~800px) cabem ao lado do card */}
            <div className="grid gap-6 min-[1760px]:grid-cols-[minmax(0,1fr)_440px]">
                <section
                    className="card overflow-hidden max-lg:overflow-visible max-lg:border-0 max-lg:bg-transparent"
                    aria-labelledby="rampsTitle"
                >
                    <h2
                        id="rampsTitle"
                        className="border-b border-border px-6 py-5 text-lg font-semibold max-lg:border-0 max-lg:px-0 max-lg:pb-3 max-lg:pt-0"
                    >
                        Rampas de temperatura
                    </h2>
                    <div
                        className="list-header hidden min-h-11 items-center gap-4 px-6 lg:grid lg:grid-cols-[56px_minmax(0,1fr)_150px_130px_140px_130px_96px]"
                        aria-hidden="true"
                    >
                        <span>Ordem</span>
                        <span>Faixa da rampa</span>
                        <span>Limites</span>
                        <span>Temporizador</span>
                        <span>Início do timer</span>
                        <span>Tempo ideal</span>
                        <span className="text-right">Ações</span>
                    </div>
                    <div id="rampDetails" aria-live="polite">
                        {rampas === null && (
                            <EmptyState
                                icon="ph-cloud-slash"
                                title="Não foi possível carregar as rampas"
                                text="Tente novamente em alguns instantes."
                            />
                        )}
                        {rampas?.length === 0 && (
                            <EmptyState
                                icon="ph-thermometer-simple"
                                title="Nenhuma rampa ainda"
                                text="Adicione a primeira rampa de temperatura desta receita."
                                action={{
                                    text: 'Adicionar rampa',
                                    icon: 'ph-plus',
                                    href: novaRampa,
                                }}
                            />
                        )}
                        {rampas?.map((rampa, i) => (
                            <LinhaRampa
                                key={rampa.id}
                                rampa={rampa}
                                ordem={rampa.orderRamp ?? i + 1}
                                recipeId={id}
                                onExcluir={() =>
                                    setConfirmacao({
                                        titulo: `Excluir a rampa ${rampa.orderRamp ?? i + 1}?`,
                                        mensagem: 'Não dá para desfazer.',
                                        botao: 'Excluir rampa',
                                        aoConfirmar: () => excluirRampa(rampa.id),
                                    })
                                }
                            />
                        ))}
                    </div>
                </section>

                <section
                    className="card flex flex-col overflow-hidden"
                    aria-labelledby="recipeLotsTitle"
                >
                    <h2
                        id="recipeLotsTitle"
                        className="border-b border-border px-6 py-5 text-lg font-semibold"
                    >
                        Lotes desta receita
                    </h2>
                    {!lotes && (
                        <div className="skeleton m-5 h-16 rounded-xl" aria-label="Carregando" />
                    )}
                    {lotes?.length === 0 && (
                        <div className="grid flex-1 place-items-center">
                            <EmptyState icon="ph-cube" title="Nenhum lote ainda" compact />
                        </div>
                    )}
                    {lotes?.map((lote) => (
                        <Link
                            key={lote.id}
                            href={`/lots/${lote.id}`}
                            className="list-row flex min-h-16 items-center justify-between gap-3 px-6 py-3 hover:bg-hover-neutral"
                        >
                            <span className="flex min-w-0 flex-col gap-0.5">
                                <span className="truncate font-semibold">{lote.name}</span>
                                <span className="text-[13px] text-muted-foreground">
                                    {inicioLote(lote.mashStart)}
                                </span>
                            </span>
                            <SeloLote status={lote.status} />
                        </Link>
                    ))}
                </section>
            </div>

            {rampas && <PerfilRampas rampas={rampas} />}

            <div className="mobile-bar lg:hidden">
                <Link id="newTemperatureLinkMobile" href={novaRampa} className="btn-primary w-full">
                    <i className="ph ph-plus" aria-hidden="true" />
                    Adicionar rampa
                </Link>
            </div>

            <RecipeNameModal
                id="renameModal"
                formId="editRecipeForm"
                open={renomeando}
                onClose={fecharRenomear}
                title="Renomear receita"
                help="Até 255 caracteres. Não pode repetir o nome de outra receita sua."
                submit="Salvar nome"
                inicial={recipe.name}
                onSubmit={renomear}
            />
            <ConfirmDialog pedido={confirmacao} onClose={() => setConfirmacao(null)} />
        </>
    );
}
