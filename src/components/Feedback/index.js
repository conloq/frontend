import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

const FLASH_KEY = 'mash-flash';
const FLASH_EVENT = 'mash-flash';

// Mensagem que sobrevive a um router.push (como o flash da sessão no EJS); a tela atual também ouve.
export function flash(tipo, texto) {
    try {
        sessionStorage.setItem(FLASH_KEY, JSON.stringify({ tipo, texto }));
    } catch {
        /* sem storage */
    }
    window.dispatchEvent(new Event(FLASH_EVENT));
}

function lerFlash() {
    try {
        const dados = JSON.parse(sessionStorage.getItem(FLASH_KEY));
        sessionStorage.removeItem(FLASH_KEY);
        return dados;
    } catch {
        return null;
    }
}

export function Messages() {
    const [mensagem, setMensagem] = useState(null);
    const ref = useRef(null);

    useEffect(() => {
        const ler = () => {
            const dados = lerFlash();
            if (!dados) return;
            setMensagem(dados);
            requestAnimationFrame(() =>
                ref.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
            );
        };
        ler();
        window.addEventListener(FLASH_EVENT, ler);
        return () => window.removeEventListener(FLASH_EVENT, ler);
    }, []);

    const sucesso = mensagem?.tipo === 'success';
    return (
        <div id="mensagens" ref={ref} className="empty:absolute" aria-live="polite">
            {mensagem && (
                <div
                    className={`${sucesso ? 'bg-sucesso-suave text-sucesso' : 'bg-perigo-suave text-perigo'} flex items-center gap-3 rounded-[10px] px-4 py-3`}
                    role={sucesso ? 'status' : 'alert'}
                >
                    <i
                        className={`ph-fill ${sucesso ? 'ph-check-circle' : 'ph-x-circle'} text-[22px]`}
                        aria-hidden="true"
                    />
                    <p className="font-semibold">{mensagem.texto}</p>
                </div>
            )}
        </div>
    );
}

export function EmptyState({ icon, title, text, action, compact }) {
    return (
        <div
            className={`flex flex-col items-center gap-3 px-6 text-center ${compact ? 'py-10' : 'py-16'}`}
        >
            <i className={`ph ${icon} text-4xl text-texto-2`} aria-hidden="true" />
            <p className={`font-display ${compact ? 'text-lg' : 'text-xl'} font-semibold`}>
                {title}
            </p>
            {text && <p className="max-w-md leading-relaxed text-texto-2">{text}</p>}
            {action && (
                <Link href={action.href} className="btn-primario mt-2">
                    <i className={`ph ${action.icon}`} aria-hidden="true" />
                    {action.text}
                </Link>
            )}
        </div>
    );
}

export function ServerError({ message }) {
    return (
        <div
            role="alert"
            className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center gap-4 p-6 text-center"
        >
            <i className="ph ph-cloud-slash text-5xl text-perigo" aria-hidden="true" />
            <h1 className="font-display text-2xl font-semibold">
                Não foi possível carregar esta página
            </h1>
            <p className="text-texto-2">{message}</p>
            <Link href="/recipes" className="btn-primario">
                Voltar às receitas
            </Link>
        </div>
    );
}

// Escape fecha, Tab fica preso dentro do painel e o foco volta para quem abriu.
function useDialogo(aberto, onClose, ref) {
    useEffect(() => {
        if (!aberto) return;
        const anterior = document.activeElement;
        const focaveis = () =>
            [
                ...ref.current.querySelectorAll(
                    'a[href], button:not([disabled]), input:not([disabled]), select, textarea'
                ),
            ].filter((el) => el.offsetParent !== null || el.type === 'file');
        (ref.current.querySelector('input:not([type=hidden]), select') ?? focaveis()[0])?.focus();
        const teclado = (event) => {
            if (event.key === 'Escape') return onClose();
            if (event.key !== 'Tab') return;
            const lista = focaveis();
            const [primeiro, ultimo] = [lista[0], lista.at(-1)];
            if (event.shiftKey && document.activeElement === primeiro) {
                event.preventDefault();
                ultimo.focus();
            } else if (!event.shiftKey && document.activeElement === ultimo) {
                event.preventDefault();
                primeiro.focus();
            }
        };
        document.addEventListener('keydown', teclado);
        return () => {
            document.removeEventListener('keydown', teclado);
            anterior?.focus?.();
        };
    }, [aberto, onClose, ref]);
}

export function Modal({ id, open, onClose, title, subtitle, width = 'max-w-[520px]', children }) {
    const ref = useRef(null);
    useDialogo(open, onClose, ref);
    if (!open) return null;
    return (
        <div
            id={id}
            ref={ref}
            className="js-modal folha fixed inset-0 z-50 bg-texto/60 p-4"
            // clique no fundo fecha; pelo teclado, o Escape de useDialogo
            role="presentation"
            onMouseDown={(event) => event.target === event.currentTarget && onClose()}
        >
            <div className="flex min-h-full items-center justify-center">
                <div
                    className={`w-full ${width} overflow-hidden rounded-2xl bg-superficie shadow-[0_24px_48px_rgba(31,26,23,0.25)]`}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby={`${id}Titulo`}
                >
                    <div className="flex items-start gap-2 px-6 pb-0 pr-4 pt-6">
                        <div className="flex flex-1 flex-col gap-1">
                            <h2 id={`${id}Titulo`} className="text-[22px] font-semibold">
                                {title}
                            </h2>
                            {subtitle && <p className="text-sm text-texto-2">{subtitle}</p>}
                        </div>
                        <button
                            type="button"
                            className="btn-icone"
                            onClick={onClose}
                            aria-label="Fechar"
                        >
                            <i className="ph ph-x" aria-hidden="true" />
                        </button>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}

export function ModalActions({ onClose, submit }) {
    return (
        <div className="acoes border-t border-linha bg-[#faf8f6] px-6 py-4">
            <button type="button" className="btn-secundario" onClick={onClose}>
                Cancelar
            </button>
            <button type="submit" className="btn-primario">
                {submit}
            </button>
        </div>
    );
}

// Substitui o confirm() do navegador; pedido = { titulo, mensagem, botao, aoConfirmar } ou null.
export function ConfirmDialog({ pedido, onClose }) {
    const ref = useRef(null);
    useDialogo(Boolean(pedido), onClose, ref);
    if (!pedido) return null;
    return (
        <div
            id="dialogoConfirmar"
            ref={ref}
            className="folha fixed inset-0 z-[70] flex items-center justify-center bg-texto/60 p-4"
            // clique no fundo fecha; pelo teclado, o Escape de useDialogo
            role="presentation"
            onMouseDown={(event) => event.target === event.currentTarget && onClose()}
        >
            <div
                className="w-full max-w-[440px] overflow-hidden rounded-2xl bg-superficie shadow-[0_24px_48px_rgba(31,26,23,0.25)]"
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="dialogoConfirmarTitulo"
                aria-describedby="dialogoConfirmarMensagem"
            >
                <div className="flex flex-col gap-1.5 p-6 pb-5">
                    <h2 id="dialogoConfirmarTitulo" className="text-xl font-semibold">
                        {pedido.titulo}
                    </h2>
                    <p id="dialogoConfirmarMensagem" className="leading-relaxed text-texto-2">
                        {pedido.mensagem}
                    </p>
                </div>
                <div className="acoes border-t border-linha bg-[#faf8f6] px-6 py-4">
                    <button type="button" className="btn-secundario" onClick={onClose}>
                        Cancelar
                    </button>
                    <button
                        type="button"
                        className="btn-perigo"
                        onClick={() => {
                            onClose();
                            pedido.aoConfirmar();
                        }}
                    >
                        <i className="ph ph-trash" aria-hidden="true" />
                        <span id="dialogoConfirmarBotao">{pedido.botao ?? 'Excluir'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

// Campo do design system: erro troca a ajuda e marca .campo-erro (antigo erroCampo).
export function Field({
    name,
    inputId = name,
    label,
    help,
    error,
    unit,
    children,
    className = '',
}) {
    return (
        <div className={`campo ${error ? 'campo-erro' : ''} ${className}`} data-campo={name}>
            <label className="campo-rotulo" htmlFor={inputId}>
                {label}
            </label>
            <span className="campo-caixa relative">
                {children}
                {unit && <span className="campo-unidade">{unit}</span>}
            </span>
            {(error || help) && (
                <span className="campo-ajuda" data-erro>
                    {error ?? help}
                </span>
            )}
        </div>
    );
}

export function PasswordInput({ id, ...props }) {
    const [visivel, setVisivel] = useState(false);
    return (
        <>
            <input id={id} name={id} type={visivel ? 'text' : 'password'} {...props} />
            <button
                type="button"
                className="btn-icone -mr-2"
                data-toggle-senha={id}
                aria-label={visivel ? 'Ocultar senha' : 'Mostrar senha'}
                onClick={() => setVisivel(!visivel)}
            >
                <i className={`ph ${visivel ? 'ph-eye-slash' : 'ph-eye'}`} aria-hidden="true" />
            </button>
        </>
    );
}

export const plural = (n, um, varios) => `${n} ${n === 1 ? um : varios}`;
export const dataBr = (valor) => (valor ? new Date(valor).toLocaleDateString('pt-BR') : '—');
