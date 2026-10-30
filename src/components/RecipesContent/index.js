import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
    ConfirmDialog,
    dataBr,
    EmptyState,
    Field,
    flash,
    Modal,
    ModalActions,
    plural,
} from '@/components/Feedback';
import { api, mensagemErro } from '@/services/api';
import { getAxiosConfig } from '@/services/auth';

export function faixaRampas(rampas) {
    if (!rampas.length) return '—';
    const min = Math.min(...rampas.map((rampa) => rampa.minTemperatureRamp));
    const max = Math.max(...rampas.map((rampa) => rampa.maxTemperatureRamp));
    return `${min} – ${max} ºC`;
}

// Pedido de exclusão de receita; usado também no detalhe.
export const pedidoExcluirReceita = (titulo, aoConfirmar) => ({
    titulo,
    mensagem:
        'As rampas de temperatura desta receita também serão excluídas. Não dá para desfazer.',
    botao: 'Excluir receita',
    aoConfirmar,
});

// Modal de criar ou renomear: só valida nome vazio, o resto (duplicado, tamanho) a API responde.
export function RecipeNameModal({
    id,
    formId,
    open,
    onClose,
    title,
    subtitle,
    help,
    submit,
    inicial = '',
    onSubmit,
}) {
    const [nome, setNome] = useState(inicial);
    const [erro, setErro] = useState(null);
    useEffect(() => {
        if (open) {
            setNome(inicial);
            setErro(null);
        }
    }, [open, inicial]);

    const enviar = async (event) => {
        event.preventDefault();
        if (!nome.trim()) {
            setErro('Nome não pode estar vazio');
            return event.target.elements.name.focus();
        }
        setErro(null);
        await onSubmit(nome.trim());
    };

    return (
        <Modal id={id} open={open} onClose={onClose} title={title} subtitle={subtitle}>
            <form id={formId} noValidate onSubmit={enviar}>
                <div className="flex flex-col gap-4 p-6">
                    <Field
                        name="name"
                        inputId={`${id}Name`}
                        label="Nome da receita"
                        help={help}
                        error={erro}
                    >
                        <input
                            id={`${id}Name`}
                            name="name"
                            value={nome}
                            onChange={(event) => setNome(event.target.value)}
                            maxLength={255}
                            placeholder="Ex.: American Pale Ale"
                            aria-invalid={erro ? 'true' : undefined}
                            required
                        />
                    </Field>
                </div>
                <ModalActions onClose={onClose} submit={submit} />
            </form>
        </Modal>
    );
}

export default function RecipesContent() {
    const [receitas, setReceitas] = useState(null);
    const [busca, setBusca] = useState('');
    const [criando, setCriando] = useState(false);
    const [confirmacao, setConfirmacao] = useState(null);

    const carregar = useCallback(async () => {
        try {
            const { data } = await api.get('/recipes', getAxiosConfig());
            const lista = await Promise.all(
                (data.recipes ?? []).map(async (receita) => {
                    try {
                        const rampas =
                            (await api.get(`/recipes/${receita.id}/temperatures`, getAxiosConfig()))
                                .data.temperatures ?? [];
                        return { ...receita, rampas, faixa: faixaRampas(rampas) };
                    } catch {
                        return { ...receita, rampas: null, faixa: 'Não foi possível carregar' };
                    }
                })
            );
            setReceitas(lista);
        } catch (error) {
            flash('danger', mensagemErro(error, 'Não foi possível carregar as receitas.'));
            setReceitas([]);
        }
    }, []);

    useEffect(() => {
        carregar();
    }, [carregar]);

    const criar = async (name) => {
        try {
            const { data } = await api.post('/recipes', { name }, getAxiosConfig());
            flash('success', data?.message ?? 'Receita criada com sucesso.');
            setCriando(false);
            carregar();
        } catch (error) {
            flash('danger', mensagemErro(error, 'Não foi possível salvar os dados.'));
        }
    };

    const excluir = async (id) => {
        try {
            await api.delete(`/recipes/${id}`, getAxiosConfig());
            flash('success', 'Receita excluída.');
            carregar();
        } catch (error) {
            flash('danger', mensagemErro(error, 'Não foi possível excluir a receita.'));
        }
    };

    const termo = busca.trim().toLowerCase();
    const visiveis = (receitas ?? []).filter((receita) =>
        receita.name.toLowerCase().includes(termo)
    );

    return (
        <>
            <div className="flex flex-wrap items-end justify-between gap-4 max-md:contents">
                <h1 className="text-[30px] font-semibold max-md:sr-only">Receitas</h1>
                <button
                    type="button"
                    className="btn-primary max-md:hidden"
                    onClick={() => setCriando(true)}
                >
                    <i className="ph ph-plus" aria-hidden="true" />
                    Nova receita
                </button>
            </div>

            <section
                className="card overflow-hidden max-md:overflow-visible max-md:border-0 max-md:bg-transparent"
                aria-labelledby="recipeTableTitle"
            >
                <h2 id="recipeTableTitle" className="sr-only">
                    Lista de receitas
                </h2>
                <div className="flex flex-wrap items-center gap-3 border-b border-border px-5 py-4 max-md:border-0 max-md:px-0 max-md:pt-0">
                    <label className="field-box min-h-11 flex-1 sm:w-[360px] sm:flex-none">
                        <i className="ph ph-magnifying-glass" aria-hidden="true" />
                        <span className="sr-only">Buscar receita</span>
                        <input
                            id="recipeSearch"
                            type="search"
                            placeholder="Buscar por nome da receita"
                            autoComplete="off"
                            value={busca}
                            onChange={(event) => setBusca(event.target.value)}
                        />
                    </label>
                    <button
                        type="button"
                        className="grid size-12 shrink-0 place-items-center rounded-[10px] bg-action text-2xl text-white hover:bg-action-hover md:hidden"
                        onClick={() => setCriando(true)}
                        aria-label="Nova receita"
                    >
                        <i className="ph ph-plus" aria-hidden="true" />
                    </button>
                    {receitas && (
                        <span
                            id="recipeCount"
                            className="ml-auto text-sm text-muted-foreground max-md:hidden"
                        >
                            {plural(receitas.length, 'receita', 'receitas')}
                        </span>
                    )}
                </div>
                <div
                    className="list-header hidden min-h-11 items-center gap-4 px-5 md:grid md:grid-cols-[minmax(0,1fr)_120px_200px_150px_148px]"
                    aria-hidden="true"
                >
                    <span>Receita</span>
                    <span>Rampas</span>
                    <span>Faixa das rampas</span>
                    <span>Criada em</span>
                    <span className="text-right">Ações</span>
                </div>
                <div
                    id="recipeList"
                    className="max-md:overflow-hidden max-md:rounded-xl max-md:border max-md:border-border max-md:bg-surface"
                    aria-live="polite"
                >
                    {!receitas && (
                        <div className="skeleton m-5 h-24 rounded-xl" aria-label="Carregando" />
                    )}
                    {receitas && !receitas.length && (
                        <EmptyState
                            icon="ph-bowl-food"
                            title="Nenhuma receita ainda"
                            text="Crie uma receita para começar a organizar as rampas de temperatura."
                            action={{
                                onClick: () => setCriando(true),
                                icon: 'ph-plus',
                                text: 'Criar primeira receita',
                            }}
                        />
                    )}
                    {visiveis.map((receita) => (
                        <div
                            key={receita.id}
                            className="list-row relative grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-0.5 px-4 py-3.5 max-md:hover:bg-hover-neutral md:min-h-[68px] md:grid-cols-[minmax(0,1fr)_120px_200px_150px_148px] md:px-5 md:py-0"
                        >
                            <Link
                                href={`/recipes/${receita.id}`}
                                className="truncate font-semibold max-md:text-[17px] max-md:after:absolute max-md:after:inset-0 hover:text-action md:hover:underline"
                            >
                                {receita.name}
                            </Link>
                            <span className="flex gap-1 text-sm text-muted-foreground max-md:col-start-1 md:contents md:text-[15px]">
                                <span className="md:text-foreground">
                                    {receita.rampas
                                        ? plural(receita.rampas.length, 'rampa', 'rampas')
                                        : '—'}
                                </span>
                                <span className="md:hidden" aria-hidden="true">
                                    ·
                                </span>
                                <span className="md:font-medium md:text-foreground">
                                    {receita.faixa}
                                </span>
                            </span>
                            <span className="text-[15px] max-md:hidden">
                                {dataBr(receita.createdAt)}
                            </span>
                            <i
                                className="ph ph-caret-right col-start-2 row-span-2 row-start-1 text-xl text-muted-foreground md:hidden"
                                aria-hidden="true"
                            />
                            <span className="-mr-2 flex justify-end gap-1 max-md:hidden">
                                <Link
                                    href={`/recipes/${receita.id}/temperatures/new`}
                                    className="btn-icon"
                                    title="Adicionar rampa"
                                >
                                    <i className="ph ph-thermometer-simple" aria-hidden="true" />
                                </Link>
                                <Link
                                    href={`/recipes/${receita.id}/edit`}
                                    className="btn-icon"
                                    title="Editar"
                                >
                                    <i className="ph ph-pencil-simple" aria-hidden="true" />
                                </Link>
                                <button
                                    type="button"
                                    className="btn-icon-danger"
                                    title="Excluir"
                                    onClick={() =>
                                        setConfirmacao(
                                            pedidoExcluirReceita('Excluir receita?', () =>
                                                excluir(receita.id)
                                            )
                                        )
                                    }
                                >
                                    <i className="ph ph-trash" aria-hidden="true" />
                                </button>
                            </span>
                        </div>
                    ))}
                </div>
            </section>

            <RecipeNameModal
                id="recipeModal"
                formId="recipeForm"
                open={criando}
                onClose={() => setCriando(false)}
                title="Nova receita"
                subtitle="Depois de criar, você adiciona as rampas de temperatura."
                help="Até 255 caracteres."
                submit="Criar receita"
                onSubmit={criar}
            />
            <ConfirmDialog pedido={confirmacao} onClose={() => setConfirmacao(null)} />
        </>
    );
}
