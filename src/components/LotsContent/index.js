import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
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

export const STATUS_LOTE = {
    active: ['badge-info', 'Em andamento'],
    completed: ['badge-success', 'Concluído'],
};

export function SeloLote({ status }) {
    const [classe, texto] = STATUS_LOTE[status] ?? STATUS_LOTE.active;
    return <span className={classe}>{texto}</span>;
}

// ISO da API no formato do input datetime-local, no fuso do navegador
const paraLocal = (iso) => {
    const data = new Date(iso);
    data.setMinutes(data.getMinutes() - data.getTimezoneOffset());
    return data.toISOString().slice(0, 16);
};

// Novo/editar lote em modal; só valida nome e receita, o resto a API responde.
export function LotForm({ onClose, onSalvo, lote }) {
    const editando = Boolean(lote);
    const [receitas, setReceitas] = useState(null);
    const [erroReceitas, setErroReceitas] = useState(false);
    const [erros, setErros] = useState({});
    // Criando os estados para as informações do lote
    const [nome, setNome] = useState(lote?.name ?? '');
    const [recipeId, setRecipeId] = useState(lote?.recipeId ?? '');
    const [inicio, setInicio] = useState(lote ? paraLocal(lote.mashStart) : '');
    const [status, setStatus] = useState(lote?.status === 'completed' ? 'completed' : 'active');

    useEffect(() => {
        api.get('/recipes', getAxiosConfig())
            .then(({ data }) => setReceitas(data.recipes ?? []))
            .catch(() => setErroReceitas(true));
    }, []);

    const salvar = async (event) => {
        event.preventDefault();
        const name = nome.trim();
        const novos = {};
        if (!name) novos.name = 'Nome não pode estar vazio';
        if (!Number(recipeId)) novos.recipeId = 'Escolha uma receita';
        setErros(novos);
        if (Object.keys(novos).length) return event.target.elements[Object.keys(novos)[0]].focus();
        const dados = {
            name,
            recipeId: Number(recipeId),
            status,
            ...(inicio && { mashStart: new Date(inicio).toISOString() }),
        };
        try {
            const { data } = editando
                ? await api.put(`/lots/${lote.id}`, dados, getAxiosConfig())
                : await api.post('/lots', dados, getAxiosConfig());
            flash('success', data?.message ?? 'Lote salvo.');
            onSalvo(data?.lot?.id ?? lote.id);
        } catch (error) {
            flash('danger', mensagemErro(error, 'Não foi possível salvar os dados.'));
        }
    };

    return (
        <Modal
            id="lotModal"
            open
            onClose={onClose}
            title={editando ? 'Editar lote' : 'Novo lote'}
            subtitle={editando ? null : 'Um lote é uma brassagem feita com uma das suas receitas.'}
            width="max-w-[560px]"
        >
            <form id="lotForm" noValidate onSubmit={salvar}>
                <div className="flex flex-col gap-4 p-6">
                    <Field name="name" inputId="lotName" label="Nome do lote" error={erros.name}>
                        <input
                            id="lotName"
                            name="name"
                            onChange={(e) => setNome(e.target.value)}
                            value={nome}
                            aria-invalid={erros.name ? 'true' : undefined}
                            maxLength={255}
                            placeholder="Ex.: Lote 20/10"
                            required
                        />
                    </Field>
                    <Field
                        name="recipeId"
                        inputId="lotRecipe"
                        label="Receita"
                        error={erros.recipeId}
                    >
                        <select
                            id="lotRecipe"
                            name="recipeId"
                            onChange={(e) => setRecipeId(e.target.value)}
                            value={recipeId}
                            aria-invalid={erros.recipeId ? 'true' : undefined}
                            required
                        >
                            {erroReceitas ? (
                                <option value="">Não foi possível carregar as receitas</option>
                            ) : !receitas?.length ? (
                                <option value="">
                                    {receitas
                                        ? 'Nenhuma receita cadastrada'
                                        : 'Carregando receitas…'}
                                </option>
                            ) : (
                                <>
                                    <option value="">Escolha uma receita</option>
                                    {receitas.map((receita) => (
                                        <option key={receita.id} value={receita.id}>
                                            {receita.name}
                                        </option>
                                    ))}
                                </>
                            )}
                        </select>
                        <i
                            className="ph ph-caret-down pointer-events-none absolute right-3.5 text-lg!"
                            aria-hidden="true"
                        />
                    </Field>
                    <Field
                        name="mashStart"
                        inputId="lotStart"
                        label="Início da mosturação (opcional)"
                        help={
                            editando
                                ? 'Em branco, mantém o início gravado.'
                                : 'Em branco, o MASH usa a data e a hora do cadastro.'
                        }
                    >
                        <input
                            id="lotStart"
                            name="mashStart"
                            type="datetime-local"
                            onChange={(e) => setInicio(e.target.value)}
                            value={inicio}
                        />
                    </Field>
                    <div className="field" role="radiogroup" aria-labelledby="lotStatusLabel">
                        <span id="lotStatusLabel" className="field-label">
                            Status
                        </span>
                        <div className="segmented w-full">
                            <label>
                                <input
                                    type="radio"
                                    name="status"
                                    value="active"
                                    className="sr-only"
                                    checked={status === 'active'}
                                    onChange={(e) => setStatus(e.target.value)}
                                />
                                Em andamento
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    name="status"
                                    value="completed"
                                    className="sr-only"
                                    checked={status === 'completed'}
                                    onChange={(e) => setStatus(e.target.value)}
                                />
                                Concluído
                            </label>
                        </div>
                    </div>
                </div>
                <ModalActions
                    onClose={onClose}
                    submit={editando ? 'Salvar alterações' : 'Criar lote'}
                />
            </form>
        </Modal>
    );
}

export default function LotsContent({ form = false }) {
    const router = useRouter();
    const [lotes, setLotes] = useState(null);
    const [receitas, setReceitas] = useState({});
    const [busca, setBusca] = useState('');
    const [confirmacao, setConfirmacao] = useState(null);

    const carregar = useCallback(() => {
        api.get('/lots', getAxiosConfig())
            .then(({ data }) => setLotes(data.lots ?? []))
            .catch((error) => {
                flash('danger', mensagemErro(error, 'Não foi possível carregar os lotes.'));
                setLotes([]);
            });
    }, []);

    useEffect(() => {
        carregar();
        // o lote traz só o recipeId; o nome vem da lista de receitas
        api.get('/recipes', getAxiosConfig())
            .then(({ data }) =>
                setReceitas(Object.fromEntries((data.recipes ?? []).map((r) => [r.id, r.name])))
            )
            .catch(() => {});
    }, [carregar]);

    const excluir = async (id) => {
        try {
            await api.delete(`/lots/${id}`, getAxiosConfig());
            flash('success', 'Lote excluído.');
            carregar();
        } catch (error) {
            flash('danger', mensagemErro(error, 'Não foi possível excluir o lote.'));
        }
    };

    const termo = busca.trim().toLowerCase();
    const visiveis = (lotes ?? []).filter((lote) => lote.name.toLowerCase().includes(termo));

    return (
        <>
            <div className="flex flex-wrap items-end justify-between gap-4 max-md:contents">
                <h1 className="text-[30px] font-semibold max-md:sr-only">Lotes</h1>
                <Link href="/lots/new" className="btn-primary max-md:hidden">
                    <i className="ph ph-plus" aria-hidden="true" />
                    Novo lote
                </Link>
            </div>

            <section
                className="card overflow-hidden max-md:overflow-visible max-md:border-0 max-md:bg-transparent"
                aria-labelledby="lotTableTitle"
            >
                <h2 id="lotTableTitle" className="sr-only">
                    Lista de lotes
                </h2>
                <div className="flex flex-wrap items-center gap-3 border-b border-border px-5 py-4 max-md:border-0 max-md:px-0 max-md:pt-0">
                    <label className="field-box min-h-11 flex-1 sm:w-[360px] sm:flex-none">
                        <i className="ph ph-magnifying-glass" aria-hidden="true" />
                        <span className="sr-only">Buscar lote</span>
                        <input
                            id="lotSearch"
                            type="search"
                            placeholder="Buscar por nome do lote"
                            autoComplete="off"
                            value={busca}
                            onChange={(event) => setBusca(event.target.value)}
                        />
                    </label>
                    <Link
                        href="/lots/new"
                        className="grid size-12 shrink-0 place-items-center rounded-[10px] bg-action text-2xl text-white hover:bg-action-hover md:hidden"
                        aria-label="Novo lote"
                    >
                        <i className="ph ph-plus" aria-hidden="true" />
                    </Link>
                    {lotes && (
                        <span
                            id="lotCount"
                            className="ml-auto text-sm text-muted-foreground max-md:hidden"
                        >
                            {plural(lotes.length, 'lote', 'lotes')}
                        </span>
                    )}
                </div>
                <div
                    className="list-header hidden min-h-11 items-center gap-4 px-5 md:grid md:grid-cols-[minmax(0,1fr)_200px_150px_150px_104px]"
                    aria-hidden="true"
                >
                    <span>Lote</span>
                    <span>Receita</span>
                    <span>Criado em</span>
                    <span>Status</span>
                    <span className="text-right">Ações</span>
                </div>
                <div
                    id="lotList"
                    className="max-md:overflow-hidden max-md:rounded-xl max-md:border max-md:border-border max-md:bg-surface"
                    aria-live="polite"
                >
                    {!lotes && (
                        <div className="skeleton m-5 h-24 rounded-xl" aria-label="Carregando" />
                    )}
                    {lotes && !lotes.length && (
                        <EmptyState
                            icon="ph-cube"
                            title="Nenhum lote ainda"
                            text="Um lote liga uma receita a uma mosturação, com as leituras de temperatura e do teste de iodo."
                            action={{
                                href: '/lots/new',
                                icon: 'ph-plus',
                                text: 'Criar primeiro lote',
                            }}
                        />
                    )}
                    {visiveis.map((lote) => (
                        <div
                            key={lote.id}
                            className="list-row relative grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-0.5 px-4 py-3.5 max-md:hover:bg-hover-neutral md:min-h-[68px] md:grid-cols-[minmax(0,1fr)_200px_150px_150px_104px] md:px-5 md:py-0"
                        >
                            <Link
                                href={`/lots/${lote.id}`}
                                className="truncate font-semibold max-md:text-[17px] max-md:after:absolute max-md:after:inset-0 hover:text-action md:hover:underline"
                            >
                                {lote.name}
                            </Link>
                            <span className="flex min-w-0 items-center gap-2 text-sm text-muted-foreground max-md:col-start-1 md:contents md:text-[15px]">
                                <span className="truncate md:text-foreground">
                                    {receitas[lote.recipeId] ?? '—'}
                                </span>
                                <span className="text-[15px] text-foreground max-md:hidden">
                                    {dataBr(lote.createdAt)}
                                </span>
                                <span>
                                    <SeloLote status={lote.status} />
                                </span>
                            </span>
                            <i
                                className="ph ph-caret-right col-start-2 row-span-2 row-start-1 text-xl text-muted-foreground md:hidden"
                                aria-hidden="true"
                            />
                            <span className="-mr-2 flex justify-end gap-1 max-md:hidden">
                                <Link
                                    href={`/lots/${lote.id}/edit`}
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
                                        setConfirmacao({
                                            titulo: `Excluir o lote ${lote.name}?`,
                                            mensagem: 'Não dá para desfazer.',
                                            botao: 'Excluir lote',
                                            aoConfirmar: () => excluir(lote.id),
                                        })
                                    }
                                >
                                    <i className="ph ph-trash" aria-hidden="true" />
                                </button>
                            </span>
                        </div>
                    ))}
                </div>
            </section>

            {form && (
                <LotForm
                    onClose={() => router.push('/lots')}
                    onSalvo={(id) => router.push(`/lots/${id}`)}
                />
            )}
            <ConfirmDialog pedido={confirmacao} onClose={() => setConfirmacao(null)} />
        </>
    );
}
