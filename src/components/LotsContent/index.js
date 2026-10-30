import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import AppShell from '@/components/AppShell';
import {
    dataBr,
    EmptyState,
    Field,
    flash,
    Modal,
    ModalActions,
    plural,
} from '@/components/Feedback';
import { api, mensagemErro } from '@/services/api';

export const STATUS_LOTE = {
    active: ['selo-info', 'Em andamento'],
    completed: ['selo-sucesso', 'Concluído'],
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

    useEffect(() => {
        api.get('/recipes')
            .then(({ data }) => setReceitas(data.recipes ?? []))
            .catch(() => setErroReceitas(true));
    }, []);

    const salvar = async (event) => {
        event.preventDefault();
        const form = new FormData(event.target);
        const name = form.get('name').trim();
        const recipeId = Number(form.get('recipeId'));
        const novos = {};
        if (!name) novos.name = 'Nome não pode estar vazio';
        if (!recipeId) novos.recipeId = 'Escolha uma receita';
        setErros(novos);
        if (Object.keys(novos).length) return event.target.elements[Object.keys(novos)[0]].focus();
        const inicio = form.get('mashStart');
        const dados = {
            name,
            recipeId,
            status: form.get('status'),
            ...(inicio && { mashStart: new Date(inicio).toISOString() }),
        };
        try {
            const { data } = editando
                ? await api.put(`/lots/${lote.id}`, dados)
                : await api.post('/lots', dados);
            flash('success', data?.message ?? 'Lote salvo.');
            onSalvo(data?.lot?.id ?? lote.id);
        } catch (error) {
            flash('danger', mensagemErro(error, 'Não foi possível salvar os dados.'));
        }
    };

    return (
        <Modal
            id="modalLote"
            open
            onClose={onClose}
            title={editando ? 'Editar lote' : 'Novo lote'}
            subtitle={editando ? null : 'Um lote é uma brassagem feita com uma das suas receitas.'}
            width="max-w-[560px]"
        >
            <form id="formLote" noValidate onSubmit={salvar}>
                <div className="flex flex-col gap-4 p-6">
                    <Field name="name" inputId="loteNome" label="Nome do lote" error={erros.name}>
                        <input
                            id="loteNome"
                            name="name"
                            defaultValue={lote?.name}
                            aria-invalid={erros.name ? 'true' : undefined}
                            maxLength={255}
                            placeholder="Ex.: Lote 20/10"
                            required
                        />
                    </Field>
                    <Field
                        name="recipeId"
                        inputId="loteReceita"
                        label="Receita"
                        error={erros.recipeId}
                    >
                        {/* key remonta o select quando as receitas chegam, para o defaultValue valer */}
                        <select
                            key={receitas ? 'receitas' : 'carregando'}
                            id="loteReceita"
                            name="recipeId"
                            defaultValue={lote?.recipeId ?? ''}
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
                        inputId="loteInicio"
                        label="Início da mosturação (opcional)"
                        help={
                            editando
                                ? 'Em branco, mantém o início gravado.'
                                : 'Em branco, o MASH usa a data e a hora do cadastro.'
                        }
                    >
                        <input
                            id="loteInicio"
                            name="mashStart"
                            type="datetime-local"
                            defaultValue={lote ? paraLocal(lote.mashStart) : undefined}
                        />
                    </Field>
                    <div className="campo" role="radiogroup" aria-labelledby="loteStatusRotulo">
                        <span id="loteStatusRotulo" className="campo-rotulo">
                            Status
                        </span>
                        <div className="segmentado w-full">
                            <label>
                                <input
                                    type="radio"
                                    name="status"
                                    value="active"
                                    className="sr-only"
                                    defaultChecked={lote?.status !== 'completed'}
                                />
                                Em andamento
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    name="status"
                                    value="completed"
                                    className="sr-only"
                                    defaultChecked={lote?.status === 'completed'}
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

    useEffect(() => {
        api.get('/lots')
            .then(({ data }) => setLotes(data.lots ?? []))
            .catch((error) => {
                flash('danger', mensagemErro(error, 'Não foi possível carregar os lotes.'));
                setLotes([]);
            });
        // o lote traz só o recipeId; o nome vem da lista de receitas
        api.get('/recipes')
            .then(({ data }) =>
                setReceitas(Object.fromEntries((data.recipes ?? []).map((r) => [r.id, r.name])))
            )
            .catch(() => {});
    }, []);

    return (
        <AppShell title="Lotes" trail={['Lotes', 'Todos os lotes']}>
            <h1 className="text-[30px] font-semibold max-md:sr-only">Lotes</h1>
            <div className="card flex items-center gap-4 px-4 py-3 md:hidden">
                <p className="flex-1 text-texto-2">
                    {lotes?.length ? plural(lotes.length, 'lote', 'lotes') : 'Nenhum lote'}
                </p>
                <Link href="/lots/new" className="btn-primario">
                    <i className="ph ph-plus" aria-hidden="true" />
                    Novo lote
                </Link>
            </div>
            <div className="tabela-cabecalho card hidden min-h-16 items-center gap-4 bg-superficie! px-5 md:grid md:grid-cols-[minmax(0,1fr)_220px_160px_150px_44px]">
                <span aria-hidden="true">Nome do lote</span>
                <span aria-hidden="true">Receita</span>
                <span aria-hidden="true">Data de criação</span>
                <span aria-hidden="true">Status</span>
                <Link
                    href="/lots/new"
                    className="btn-primario size-11 min-h-0 p-0"
                    aria-label="Novo lote"
                    title="Novo lote"
                >
                    <i className="ph ph-plus text-lg" aria-hidden="true" />
                </Link>
            </div>
            <section className="card overflow-hidden" aria-labelledby="tituloTabelaLotes">
                <h2 id="tituloTabelaLotes" className="sr-only">
                    Lista de lotes
                </h2>
                <div id="listaLotes" aria-live="polite">
                    {!lotes && (
                        <div className="esqueleto m-5 h-24 rounded-xl" aria-label="Carregando" />
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
                    {lotes?.map((lote) => (
                        <div
                            key={lote.id}
                            className="tabela-linha relative grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-0.5 px-4 py-3.5 md:min-h-[68px] md:grid-cols-[minmax(0,1fr)_220px_160px_150px_44px] md:px-5 md:py-0"
                        >
                            <Link
                                href={`/lots/${lote.id}`}
                                className="truncate font-semibold max-md:after:absolute max-md:after:inset-0 hover:text-acao md:hover:underline"
                            >
                                {lote.name}
                            </Link>
                            <span className="truncate text-sm text-texto-2 max-md:col-start-1 md:text-[15px] md:text-texto">
                                {receitas[lote.recipeId] ?? '—'}
                            </span>
                            <span className="text-[15px] max-md:hidden">
                                {dataBr(lote.createdAt)}
                            </span>
                            <span className="max-md:col-start-2 max-md:row-span-2 max-md:row-start-1">
                                <SeloLote status={lote.status} />
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
        </AppShell>
    );
}
