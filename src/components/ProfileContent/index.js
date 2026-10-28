import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import AppShell, { useUser } from '@/components/AppShell';
import { ConfirmDialog, dataBr, Field, flash, PasswordInput } from '@/components/Feedback';
import { api, mensagemErro } from '@/services/api';
import { signOut } from '@/services/auth';

// GET /user/login-history ainda não existe no Back-End (conloq/mash#102): 404 vira lista vazia.
function useAcessos() {
    const [estado, setEstado] = useState({ acessos: [], erro: false });
    useEffect(() => {
        api.get('/user/login-history')
            .then(({ data }) => setEstado({ acessos: data.loginHistory ?? [], erro: false }))
            .catch((error) => setEstado({ acessos: [], erro: error.response?.status !== 404 }));
    }, []);
    return estado;
}

function CardAcessos({ className = '' }) {
    const { acessos, erro } = useAcessos();
    return (
        <section
            className={`card flex flex-col p-6 max-lg:px-4 max-lg:py-1 ${className}`}
            aria-labelledby="tituloAcessos"
        >
            <div className="flex flex-col gap-0.5 pb-2 max-lg:sr-only">
                <h2 id="tituloAcessos" className="text-lg font-semibold">
                    Últimos acessos
                </h2>
                <p className="text-sm text-texto-2">Entradas recentes na sua conta.</p>
            </div>
            <div id="listaAcessos" className="flex flex-col" role="list" aria-live="polite">
                {erro && (
                    <p className="py-4 text-sm text-perigo">
                        Não foi possível carregar os acessos. Tente novamente.
                    </p>
                )}
                {!erro && !acessos.length && (
                    <p className="py-4 text-sm text-texto-2">Nenhum acesso registrado</p>
                )}
                {acessos.map((acesso, i) => {
                    const data = new Date(acesso.loggedAt);
                    return (
                        <div
                            key={i}
                            className="flex items-center gap-3 border-b border-linha py-3 last:border-b-0"
                            role="listitem"
                        >
                            <span className="grid size-9 shrink-0 place-items-center rounded-[10px] bg-fundo max-lg:hidden">
                                <i
                                    className="ph ph-map-pin text-lg text-texto-2"
                                    aria-hidden="true"
                                />
                            </span>
                            <span className="flex min-w-0 flex-1 flex-col">
                                <span className="text-sm font-semibold">{acesso.location}</span>
                                <span className="text-[13px] text-texto-2">
                                    {data.toLocaleDateString('pt-BR')} ·{' '}
                                    {data.toLocaleTimeString('pt-BR', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}{' '}
                                    · {acesso.ipAddress}
                                </span>
                            </span>
                            {acesso.status != null && (
                                <span className={acesso.status ? 'selo-sucesso' : 'selo-aviso'}>
                                    {acesso.status ? 'Dispositivo conhecido' : 'Novo dispositivo'}
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>
        </section>
    );
}

export function AccessHistory() {
    return (
        <>
            <Link href="/profile" className="btn-voltar self-start max-lg:hidden">
                <i className="ph ph-arrow-left" aria-hidden="true" />
                Perfil
            </Link>
            <p className="text-sm text-texto-2 lg:hidden">
                Entradas recentes na sua conta. Se não reconhecer alguma, troque a senha.
            </p>
            <CardAcessos className="max-w-2xl" />
        </>
    );
}

const valoresIniciais = (user) => ({
    name: user.name ?? '',
    email: user.email ?? '',
    phone: user.phone ?? '',
    password: '',
    confirmarSenha: '',
});

function Perfil() {
    const router = useRouter();
    const { user, recarregar } = useUser();
    const [valores, setValores] = useState(() => valoresIniciais(user));
    const [erros, setErros] = useState({});
    const [confirmacao, setConfirmacao] = useState(null);

    const mudar = (event) => setValores({ ...valores, [event.target.name]: event.target.value });
    const descartar = () => {
        setValores(valoresIniciais(user));
        setErros({});
    };

    const salvar = async (event) => {
        event.preventDefault();
        const { name, email, phone, password, confirmarSenha } = valores;
        const novos = {};
        if (!name.trim()) novos.name = 'Informe seu nome.';
        if (!email.trim()) novos.email = 'Informe seu e-mail.';
        if (password && /\s/.test(password)) novos.password = 'A senha não pode conter espaços';
        if (password && password !== confirmarSenha)
            novos.confirmarSenha = 'As senhas não conferem';
        setErros(novos);
        if (Object.keys(novos).length) {
            return event.target.querySelector(`[name="${Object.keys(novos)[0]}"]`)?.focus();
        }
        try {
            const { data } = await api.put('/user', {
                name,
                email,
                phone,
                ...(password && { password }),
            });
            flash('success', data?.message ?? 'Usuário atualizado com sucesso.');
            setValores({ ...valores, password: '', confirmarSenha: '' });
            recarregar();
        } catch (error) {
            flash('danger', mensagemErro(error, 'Não foi possível salvar os dados.'));
        }
    };

    const enviarFoto = async (event) => {
        const arquivo = event.target.files[0];
        if (!arquivo) return;
        const corpo = new FormData();
        corpo.append('image', arquivo);
        try {
            const { data } = await api.put('/user/upload', corpo);
            flash('success', data?.message ?? 'Imagem enviada com sucesso.');
            recarregar();
        } catch (error) {
            flash('danger', mensagemErro(error, 'Não foi possível enviar a imagem.'));
        }
        event.target.value = '';
    };

    const excluirConta = async () => {
        try {
            await api.delete('/user');
            signOut();
            flash('success', 'Conta excluída.');
            router.push('/login');
        } catch (error) {
            flash('danger', mensagemErro(error, 'Não foi possível excluir a conta.'));
        }
    };

    const campo = (name, props) => (
        <input
            id={name}
            name={name}
            value={valores[name]}
            onChange={mudar}
            aria-invalid={erros[name] ? 'true' : undefined}
            {...props}
        />
    );

    return (
        <>
            <div className="flex flex-col gap-1.5 max-lg:contents">
                <h1 className="text-[30px] font-semibold max-lg:sr-only">Perfil</h1>
                <p className="text-texto-2 max-lg:hidden">
                    Conta criada em {dataBr(user.createdAt)}.
                </p>
            </div>
            <div className="grid gap-6 xl:grid-cols-[400px_minmax(0,1fr)]">
                <div className="flex flex-col gap-6 max-xl:contents">
                    <section
                        className="card flex flex-col items-center gap-5 p-6 max-xl:order-1 max-lg:border-0 max-lg:bg-transparent max-lg:p-0"
                        aria-labelledby="tituloFoto"
                    >
                        <div className="flex w-full flex-col gap-0.5 max-lg:sr-only">
                            <h2 id="tituloFoto" className="text-lg font-semibold">
                                Foto do perfil
                            </h2>
                            <p className="text-sm text-texto-2">
                                JPEG ou PNG. Aparece no topo das telas.
                            </p>
                        </div>
                        <form id="formFoto" className="flex w-full items-center gap-4 lg:flex-col">
                            <img
                                id="previewFoto"
                                src={user.urlImage || '/img/foto-perfil.png'}
                                alt="Sua foto de perfil"
                                className="size-[72px] rounded-full border-linha object-cover lg:size-32 lg:border-4"
                            />
                            <label className="btn-secundario cursor-pointer focus-within:outline-3 focus-within:outline-foco lg:w-full">
                                <i className="ph ph-upload-simple" aria-hidden="true" />
                                Trocar foto
                                <input
                                    id="inputFoto"
                                    name="image"
                                    type="file"
                                    accept="image/jpeg,image/png"
                                    className="sr-only"
                                    onChange={enviarFoto}
                                />
                            </label>
                        </form>
                    </section>

                    <CardAcessos className="max-lg:hidden max-xl:order-3" />
                    <Link
                        href="/profile/access-history"
                        className="card flex min-h-11 items-center gap-3 p-4 transition-colors hover:bg-fundo max-xl:order-3 lg:hidden"
                    >
                        <i
                            className="ph ph-clock-counter-clockwise text-xl text-texto-2"
                            aria-hidden="true"
                        />
                        <span className="flex min-w-0 flex-1 flex-col">
                            <span className="font-semibold">Últimos acessos</span>
                            <span className="text-[13px] text-texto-2">
                                Entradas recentes na sua conta.
                            </span>
                        </span>
                        <i className="ph ph-caret-right text-texto-2" aria-hidden="true" />
                    </Link>

                    <section
                        className="card flex flex-col gap-5 border-[#f2c9c4] p-6 max-xl:order-4 max-lg:border-0 max-lg:bg-transparent max-lg:p-0"
                        aria-labelledby="tituloExcluirConta"
                    >
                        <div className="flex flex-col gap-0.5 max-lg:sr-only">
                            <h2 id="tituloExcluirConta" className="text-lg font-semibold">
                                Excluir conta
                            </h2>
                            <p className="text-sm text-texto-2">
                                Apaga sua conta e sai do MASH. Não dá para desfazer.
                            </p>
                        </div>
                        <button
                            type="button"
                            id="btnExcluir"
                            className="btn-perigo w-full"
                            onClick={() =>
                                setConfirmacao({
                                    titulo: 'Excluir sua conta?',
                                    mensagem:
                                        'Você sai do MASH e perde o acesso às suas receitas. Não dá para desfazer.',
                                    botao: 'Excluir conta',
                                    aoConfirmar: excluirConta,
                                })
                            }
                        >
                            <i className="ph ph-trash" aria-hidden="true" />
                            Excluir minha conta
                        </button>
                    </section>
                </div>

                <form
                    id="formPerfil"
                    className="card flex flex-col gap-5 self-start p-6 max-xl:order-2 max-lg:border-0 max-lg:bg-transparent max-lg:p-0"
                    noValidate
                    onSubmit={salvar}
                >
                    <h2 className="text-lg font-semibold max-lg:sr-only">Dados da conta</h2>
                    <div className="grid gap-5 md:grid-cols-2">
                        <Field name="name" label="Nome completo" error={erros.name}>
                            {campo('name', {
                                autoComplete: 'name',
                                placeholder: 'Seu nome',
                                required: true,
                            })}
                        </Field>
                        <Field name="phone" label="Telefone (opcional)">
                            {campo('phone', {
                                type: 'tel',
                                autoComplete: 'tel',
                                placeholder: '(13) 99999-0000',
                            })}
                        </Field>
                    </div>
                    <Field name="email" label="E-mail" error={erros.email}>
                        {campo('email', {
                            type: 'email',
                            autoComplete: 'email',
                            placeholder: 'voce@email.com',
                            required: true,
                        })}
                    </Field>
                    <hr className="border-linha max-lg:hidden" />
                    <div className="flex flex-col gap-0.5 max-lg:sr-only">
                        <h2 className="text-lg font-semibold">Trocar senha</h2>
                        <p className="text-sm text-texto-2">
                            Deixe em branco para manter a senha atual.
                        </p>
                    </div>
                    <div className="grid gap-5 md:grid-cols-2">
                        <Field
                            name="password"
                            inputId="senha"
                            label="Nova senha"
                            help="Sem espaços."
                            error={erros.password}
                        >
                            <PasswordInput
                                id="senha"
                                name="password"
                                value={valores.password}
                                onChange={mudar}
                                autoComplete="new-password"
                                placeholder="Deixe em branco para manter"
                            />
                        </Field>
                        <Field
                            name="confirmarSenha"
                            label="Confirmar nova senha"
                            error={erros.confirmarSenha}
                        >
                            <PasswordInput
                                id="confirmarSenha"
                                value={valores.confirmarSenha}
                                onChange={mudar}
                                autoComplete="new-password"
                                placeholder="Confirme a nova senha"
                            />
                        </Field>
                    </div>
                    <div className="acoes pt-2 sm:self-end">
                        <button
                            type="button"
                            id="btnDescartar"
                            className="btn-secundario max-lg:hidden"
                            onClick={descartar}
                        >
                            Descartar
                        </button>
                        <button
                            type="submit"
                            id="btnSalvar"
                            className="btn-primario max-lg:col-span-2"
                        >
                            Salvar alterações
                        </button>
                    </div>
                </form>
            </div>
            <ConfirmDialog pedido={confirmacao} onClose={() => setConfirmacao(null)} />
        </>
    );
}

export default function ProfileContent() {
    return (
        <AppShell title="Perfil" trail={['Conta', 'Perfil']}>
            <Perfil />
        </AppShell>
    );
}
