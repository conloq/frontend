import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Messages, ServerError } from '@/components/Feedback';
import { mensagemErro, temToken } from '@/services/api';
import { currentUser, signOut } from '@/services/auth';

const UserContext = createContext(null);
export const useUser = () => useContext(UserContext);

const COLLAPSED_KEY = 'mash-sidebar-collapsed';

// secoes: prefixos de URL que acendem o item (o mais específico vence, como no script.js antigo)
const MENU = [
    ['/dashboard', 'ph-squares-four', 'Painel', ['/dashboard']],
    ['/recipes', 'ph-scroll', 'Receitas', ['/recipes']],
    ['/lots', 'ph-cube', 'Lotes', ['/lots']],
    ['/analyses/new', 'ph-test-tube', 'Teste de iodo', ['/analyses', '/lots/[id]/iodine']],
    ['/profile', 'ph-user-circle', 'Perfil', ['/profile']],
    ['/settings', 'ph-gear', 'Configuração', ['/settings']],
];

function itemAtivo(pathname) {
    let melhor = null;
    MENU.forEach(([href, , , secoes]) =>
        secoes.forEach((secao) => {
            if (pathname.startsWith(secao) && secao.length > (melhor?.tamanho ?? 0))
                melhor = { href, tamanho: secao.length };
        })
    );
    return melhor?.href;
}

const lerStorage = () => {
    try {
        return localStorage.getItem(COLLAPSED_KEY) === 'true';
    } catch {
        return false;
    }
};

function Sidebar({ aberto, setAberto }) {
    const router = useRouter();
    const [recolhido, setRecolhido] = useState(false);
    const ativo = itemAtivo(router.pathname);

    useEffect(() => setRecolhido(lerStorage()), []);
    // grava só na escolha do usuário: um efeito gravaria o valor inicial por cima do salvo
    const alternarRecolhido = () => {
        const novo = !recolhido;
        setRecolhido(novo);
        document.body.classList.toggle('sidebar-collapsed', novo);
        try {
            localStorage.setItem(COLLAPSED_KEY, String(novo));
        } catch {
            /* sem storage */
        }
    };
    useEffect(() => {
        document.body.classList.toggle('max-lg:overflow-hidden', aberto);
        if (!aberto) return;
        const fechar = (event) => event.key === 'Escape' && setAberto(false);
        document.addEventListener('keydown', fechar);
        return () => document.removeEventListener('keydown', fechar);
    }, [aberto, setAberto]);

    const sair = (event) => {
        event.preventDefault();
        signOut();
        router.push('/login');
    };
    const link =
        'menu-link flex min-h-12 items-center gap-3 rounded-[10px] px-3.5 font-medium transition-colors hover:bg-hover-neutro';

    return (
        <>
            <aside
                id="appSidebar"
                className={`fixed inset-y-0 left-0 z-40 flex shrink-0 flex-col border-r border-linha bg-superficie px-4 pb-5 transition-[width,transform] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] max-lg:shadow-[8px_0_32px_rgba(31,26,23,0.18)] motion-reduce:transition-none lg:translate-x-0 ${aberto ? '' : '-translate-x-full'}`}
                aria-label="Navegação principal"
                data-sidebar-state={recolhido ? 'collapsed' : 'expanded'}
            >
                <div className="sidebar-marca flex min-h-18 items-center justify-between gap-2">
                    <Link
                        href="/dashboard"
                        className="flex min-w-0 items-center gap-2.5 rounded-[10px]"
                        aria-label="MASH, ir para o painel"
                    >
                        <img
                            src="/img/logo-mash.png"
                            alt=""
                            className="size-10 shrink-0 rounded-full object-cover"
                        />
                        <span className="sidebar-label font-display text-xl font-bold tracking-wide">
                            MASH
                        </span>
                    </Link>
                    <button
                        type="button"
                        className="sidebar-collapse btn-icone hidden lg:inline-flex"
                        aria-label={recolhido ? 'Expandir menu' : 'Recolher menu'}
                        aria-controls="appSidebar"
                        aria-expanded={!recolhido}
                        onClick={alternarRecolhido}
                    >
                        <i
                            className={`ph ${recolhido ? 'ph-caret-double-right' : 'ph-caret-double-left'} text-lg`}
                            aria-hidden="true"
                        />
                    </button>
                    <button
                        type="button"
                        className="sidebar-close btn-icone lg:hidden"
                        aria-label="Fechar menu"
                        onClick={() => setAberto(false)}
                    >
                        <i className="ph ph-x" aria-hidden="true" />
                    </button>
                </div>
                <nav className="mt-3 flex flex-col gap-1">
                    {MENU.map(([href, icone, rotulo]) => (
                        <Link
                            key={href}
                            href={href}
                            className={`${link} ${ativo === href ? 'menu-link-active' : ''}`}
                            aria-current={ativo === href ? 'page' : undefined}
                            title={rotulo}
                            onClick={() => setAberto(false)}
                        >
                            <i
                                className={`ph ${icone} text-[22px] text-texto-2`}
                                aria-hidden="true"
                            />
                            <span className="sidebar-label">{rotulo}</span>
                        </Link>
                    ))}
                </nav>
                <a href="/logout" className={`${link} mt-auto`} title="Sair" onClick={sair}>
                    <i className="ph ph-sign-out text-[22px] text-texto-2" aria-hidden="true" />
                    <span className="sidebar-label">Sair</span>
                </a>
            </aside>
            <div
                id="sidebarOverlay"
                className={`fixed inset-0 z-30 bg-texto/60 transition-opacity duration-300 motion-reduce:transition-none lg:hidden ${aberto ? '' : 'pointer-events-none opacity-0'}`}
                aria-hidden="true"
                onClick={() => setAberto(false)}
            />
        </>
    );
}

function TopBar({ title, trail, back, user, setAberto }) {
    return (
        <header className="flex h-16 items-center gap-2 bg-mash-brown px-2 text-white sm:px-4 lg:h-18 lg:px-8">
            {back ? (
                <Link
                    id="voltarTopo"
                    href={back}
                    className="btn-icone text-white hover:bg-white/10 lg:hidden"
                    aria-label="Voltar"
                >
                    <i className="ph ph-arrow-left text-2xl" aria-hidden="true" />
                </Link>
            ) : (
                <button
                    type="button"
                    className="sidebar-open btn-icone text-white hover:bg-white/10 lg:hidden"
                    aria-label="Abrir menu"
                    aria-controls="appSidebar"
                    onClick={() => setAberto(true)}
                >
                    <i className="ph ph-list text-2xl" aria-hidden="true" />
                </button>
            )}
            <p
                className="min-w-0 flex-1 truncate text-center font-display text-lg font-semibold lg:hidden"
                aria-hidden="true"
            >
                {title}
            </p>
            <nav aria-label="Você está em" className="min-w-0 flex-1 max-lg:hidden">
                <ol className="flex items-center gap-2 text-[15px]">
                    {trail.map((item, i) => {
                        const ultimo = i === trail.length - 1;
                        return (
                            <li key={i} className="contents">
                                {i > 0 && (
                                    <i
                                        className="ph ph-caret-right text-sm text-header-texto-2"
                                        aria-hidden="true"
                                    />
                                )}
                                <span
                                    className={
                                        ultimo
                                            ? 'truncate font-semibold text-white'
                                            : 'hidden text-header-texto-2 sm:block'
                                    }
                                    aria-current={ultimo ? 'page' : undefined}
                                >
                                    {item}
                                </span>
                            </li>
                        );
                    })}
                </ol>
            </nav>
            <Link
                href="/profile"
                className="flex min-h-11 items-center gap-3 rounded-[10px] p-1 transition-colors hover:bg-white/10"
                aria-label="Abrir perfil"
            >
                <img
                    className="size-9 rounded-full border-2 border-white object-cover lg:size-10"
                    src={user?.urlImage || '/img/foto-perfil.png'}
                    alt=""
                />
                <span className="hidden text-right md:block">
                    <span className="block text-[15px] font-semibold leading-tight">
                        {user?.name}
                    </span>
                    <span className="block text-[13px] text-header-texto-2">{user?.email}</span>
                </span>
            </Link>
        </header>
    );
}

// Shell das telas logadas: confere o token em GET /user antes de mostrar a página (antigo proteger()).
export default function AppShell({ title, trail = [], back, children }) {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [erro, setErro] = useState(null);
    const [aberto, setAberto] = useState(false);

    const carregar = useCallback(async () => {
        try {
            setUser(await currentUser());
        } catch (error) {
            // 401 já foi para o login pelo interceptor
            if (error.response?.status !== 401)
                setErro(mensagemErro(error, 'Não foi possível carregar seus dados.'));
        }
    }, []);

    useEffect(() => {
        if (!temToken()) router.replace('/login');
        else carregar();
    }, [router, carregar]);

    if (erro) return <ServerError message={erro} />;

    return (
        <UserContext.Provider value={{ user, recarregar: carregar }}>
            <Head>
                <title>{`${title} · MASH`}</title>
            </Head>
            <div className="app-shell min-h-screen lg:flex">
                <Sidebar aberto={aberto} setAberto={setAberto} />
                <div className="app-shell-content flex min-h-screen min-w-0 flex-1 flex-col">
                    <TopBar
                        title={title}
                        trail={trail}
                        back={back}
                        user={user}
                        setAberto={setAberto}
                    />
                    <main className="flex flex-1 flex-col gap-6 px-4 py-4 sm:px-6 sm:py-6 lg:px-10 lg:py-8">
                        <Messages />
                        {user ? (
                            children
                        ) : (
                            <div className="esqueleto h-40 rounded-xl" aria-label="Carregando" />
                        )}
                    </main>
                </div>
            </div>
        </UserContext.Provider>
    );
}
