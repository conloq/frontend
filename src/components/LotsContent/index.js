import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import AppShell from '@/components/AppShell';
import { EmptyState, Field, Modal, ModalActions } from '@/components/Feedback';
import { api } from '@/services/api';

// Novo/editar lote em modal. Sem rota de lotes na API (conloq/mash#31): só as receitas vêm de GET /recipes.
export function LotForm({ onClose, editando = false }) {
    const [receitas, setReceitas] = useState(null);
    const [erroReceitas, setErroReceitas] = useState(false);

    useEffect(() => {
        api.get('/recipes')
            .then(({ data }) => setReceitas(data.recipes ?? []))
            .catch(() => setErroReceitas(true));
    }, []);

    return (
        <Modal
            id="modalLote"
            open
            onClose={onClose}
            title={editando ? 'Editar lote' : 'Novo lote'}
            subtitle={editando ? null : 'Um lote é uma brassagem feita com uma das suas receitas.'}
            width="max-w-[560px]"
        >
            {/* shortcut: sem rota de lotes, o envio só é bloqueado (decisão de 22/10/2026); ligar o POST/PUT quando existir */}
            <form
                id="formLote"
                data-sem-api="conloq/mash#31"
                noValidate
                onSubmit={(event) => event.preventDefault()}
            >
                <div className="flex flex-col gap-4 p-6">
                    <Field name="name" inputId="loteNome" label="Nome do lote">
                        <input
                            id="loteNome"
                            name="name"
                            maxLength={60}
                            placeholder="Ex.: Lote 20/10"
                            required
                        />
                    </Field>
                    <Field name="recipeId" inputId="loteReceita" label="Receita">
                        <select id="loteReceita" name="recipeId" required>
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
                        name="startedAt"
                        inputId="loteInicio"
                        label="Início da mosturação (opcional)"
                        help="Em branco, o MASH usa a data e a hora do cadastro."
                    >
                        <input id="loteInicio" name="startedAt" type="datetime-local" />
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
                                    value="andamento"
                                    className="sr-only"
                                    defaultChecked
                                />
                                Em andamento
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    name="status"
                                    value="concluido"
                                    className="sr-only"
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

// A API ainda não lista lotes: a tabela mostra o estado vazio.
export default function LotsContent({ form = false }) {
    const router = useRouter();
    return (
        <AppShell title="Lotes" trail={['Lotes', 'Todos os lotes']}>
            <h1 className="text-[30px] font-semibold max-md:sr-only">Lotes</h1>
            <div className="card flex items-center gap-4 px-4 py-3 md:hidden">
                <p className="flex-1 text-texto-2">Nenhum lote</p>
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
                <EmptyState
                    icon="ph-cube"
                    title="Nenhum lote ainda"
                    text="Um lote liga uma receita a uma mosturação, com as leituras de temperatura e do teste de iodo."
                    action={{ href: '/lots/new', icon: 'ph-plus', text: 'Criar primeiro lote' }}
                />
            </section>
            {form && <LotForm onClose={() => router.push('/lots')} />}
        </AppShell>
    );
}
