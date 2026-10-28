import { useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { PasswordInput } from '@/components/Feedback';
import { temToken } from '@/services/api';

const ETAPAS = {
    email: {
        passo: 1,
        icone: 'ph-envelope-simple',
        titulo: 'Recuperar senha',
        texto: 'Informe o e-mail da sua conta. Enviaremos um código para você criar uma nova senha.',
        botao: 'Enviar código',
    },
    codigo: {
        passo: 2,
        icone: 'ph-key',
        titulo: 'Confira seu e-mail',
        texto: 'Enviamos um código de 6 dígitos para o seu e-mail. Digite-o abaixo para continuar.',
        botao: 'Verificar código',
    },
    redefinir: {
        passo: 3,
        icone: 'ph-lock-key',
        titulo: 'Crie uma nova senha',
        texto: 'Escolha uma senha que você não use em outros sites.',
        botao: 'Salvar nova senha',
    },
};

// Seis caixas: digitar avança, Backspace volta e colar distribui os dígitos
function Codigo() {
    const caixas = useRef([]);
    const focar = (i) => caixas.current[Math.max(0, Math.min(5, i))]?.focus();

    const digitar = (i, event) => {
        event.target.value = event.target.value.replace(/\D/g, '').slice(-1);
        if (event.target.value) focar(i + 1);
    };
    const apagar = (i, event) => {
        if (event.key === 'Backspace' && !event.target.value) focar(i - 1);
    };
    const colar = (event) => {
        const digitos = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (!digitos) return;
        event.preventDefault();
        [...digitos].forEach((d, i) => (caixas.current[i].value = d));
        focar(digitos.length);
    };

    return (
        <fieldset className="flex flex-col gap-2">
            <legend className="sr-only">Código de 6 dígitos</legend>
            <div className="grid grid-cols-6 gap-2" data-codigo onPaste={colar}>
                {Array.from({ length: 6 }, (_, i) => (
                    <input
                        key={i}
                        ref={(el) => (caixas.current[i] = el)}
                        name={`digito${i + 1}`}
                        inputMode="numeric"
                        pattern="[0-9]"
                        maxLength={1}
                        placeholder="·"
                        aria-label={`Dígito ${i + 1} de 6`}
                        autoComplete={i === 0 ? 'one-time-code' : 'off'}
                        onInput={(event) => digitar(i, event)}
                        onKeyDown={(event) => apagar(i, event)}
                        className="aspect-square w-full min-w-0 rounded-[10px] border border-linha bg-superficie text-center font-display text-2xl font-semibold outline-none focus:border-foco focus:ring-2 focus:ring-foco/30"
                        required
                    />
                ))}
            </div>
        </fieldset>
    );
}

// shortcut: sem rota de recuperação (conloq/mash#73), reenviar só faz a contagem; ligar quando a rota existir
function Reenviar() {
    const [restante, setRestante] = useState(45);
    useEffect(() => {
        if (!restante) return;
        const timer = setTimeout(() => setRestante(restante - 1), 1000);
        return () => clearTimeout(timer);
    }, [restante]);
    return (
        <p className="text-center text-sm text-texto-2">
            Não recebeu?{' '}
            <button
                type="button"
                className="font-semibold text-texto-2 disabled:cursor-default enabled:text-acao enabled:underline"
                data-sem-api="conloq/mash#73"
                disabled={restante > 0}
                onClick={() => setRestante(45)}
            >
                {restante
                    ? `Reenviar em 00:${String(restante).padStart(2, '0')}`
                    : 'Reenviar código'}
            </button>
        </p>
    );
}

function Senha({ id, name, rotulo, ajuda }) {
    return (
        <div className="campo">
            <label className="campo-rotulo" htmlFor={id}>
                {rotulo}
            </label>
            <span className="campo-caixa">
                <i className="ph ph-lock-simple" aria-hidden="true" />
                <PasswordInput
                    id={id}
                    name={name}
                    autoComplete="new-password"
                    placeholder={
                        name === 'confirmarSenha' ? 'Repita a nova senha' : 'Crie uma nova senha'
                    }
                    minLength={8}
                    required
                />
            </span>
            {ajuda && <span className="campo-ajuda">{ajuda}</span>}
        </div>
    );
}

// Recuperar senha em três etapas. Sem rota na API (conloq/mash#73): cada etapa só avança para a próxima tela.
export default function ForgotPasswordContent({ etapa = 'email' }) {
    const router = useRouter();
    const e = ETAPAS[etapa];
    useEffect(() => {
        if (temToken()) router.replace('/dashboard');
    }, [router]);

    const proxima = { email: '/forgot-password/code', codigo: '/forgot-password/reset' }[etapa];
    const enviar = (event) => {
        event.preventDefault();
        if (proxima && event.target.reportValidity()) router.push(proxima);
    };

    return (
        <>
            <Head>
                <title>{`${e.titulo} · MASH`}</title>
            </Head>
            <div className="flex min-h-screen flex-col bg-superficie lg:bg-fundo">
                <header className="hidden h-18 shrink-0 items-center gap-3 bg-mash-brown px-10 lg:flex">
                    <img src="/img/logo-mash.png" alt="" className="size-10 rounded-full" />
                    <span className="font-display text-xl font-bold tracking-wide text-white">
                        MASH
                    </span>
                </header>
                <main className="relative flex flex-1 flex-col px-6 pb-8 pt-12 lg:items-center lg:pt-[150px]">
                    <img
                        src="/img/espuma.png"
                        alt=""
                        className="pointer-events-none absolute inset-x-0 top-0 hidden w-full lg:block"
                    />
                    <div className="relative -mx-6 -mt-12 mb-7 h-[220px] w-[calc(100%+3rem)] shrink-0 overflow-hidden bg-mash-brown px-6 pt-10 lg:hidden">
                        <img
                            src="/img/mash-emblema.png"
                            alt=""
                            className="pointer-events-none absolute -right-10 -top-5 w-[260px] opacity-25"
                        />
                        <div className="relative flex items-center gap-2.5">
                            <img src="/img/logo-mash.png" alt="" className="size-10 rounded-full" />
                            <span className="font-display text-xl font-bold tracking-[0.15em] text-white">
                                MASH
                            </span>
                        </div>
                        <p className="relative mt-11 font-display text-[26px] font-bold leading-tight text-white">
                            Do teste de iodo à fervura
                        </p>
                    </div>
                    <div className="relative flex w-full flex-col gap-5 lg:max-w-[480px] lg:gap-6 lg:rounded-2xl lg:bg-superficie lg:px-10 lg:pb-10 lg:pt-8 lg:shadow-[0_24px_48px_rgba(31,26,23,0.12)]">
                        <div className="flex items-center justify-between gap-3">
                            <Link
                                href="/login"
                                className="btn-voltar max-lg:min-h-0 max-lg:border-0 max-lg:bg-transparent max-lg:px-0 max-lg:text-sm"
                            >
                                <i className="ph ph-arrow-left" aria-hidden="true" />
                                Voltar para o login
                            </Link>
                            <p className="text-[13px] font-semibold text-texto-2 max-lg:hidden">
                                Passo {e.passo} de 3
                            </p>
                        </div>
                        <i
                            className={`ph ${e.icone} text-[34px] text-foco max-lg:hidden`}
                            aria-hidden="true"
                        />
                        <div className="flex flex-col gap-1.5 lg:gap-2">
                            <p className="text-[13px] font-semibold text-texto-2 lg:hidden">
                                Passo {e.passo} de 3
                            </p>
                            <h1 className="text-[22px] font-semibold lg:text-[32px] lg:font-bold">
                                {e.titulo}
                            </h1>
                            <p className="text-sm text-texto-2 lg:text-[15px]">{e.texto}</p>
                        </div>
                        <form
                            id="formRecuperar"
                            className="flex flex-col gap-5 lg:gap-6"
                            data-sem-api="conloq/mash#73"
                            noValidate
                            onSubmit={enviar}
                        >
                            {etapa === 'email' && (
                                <label className="campo" htmlFor="email">
                                    <span className="campo-rotulo">E-mail</span>
                                    <span className="campo-caixa">
                                        <i className="ph ph-envelope-simple" aria-hidden="true" />
                                        <input
                                            id="email"
                                            type="email"
                                            name="email"
                                            autoComplete="email"
                                            placeholder="voce@email.com"
                                            required
                                        />
                                    </span>
                                </label>
                            )}
                            {etapa === 'codigo' && <Codigo />}
                            {etapa === 'redefinir' && (
                                <>
                                    <Senha
                                        id="senha"
                                        name="password"
                                        rotulo="Nova senha"
                                        ajuda="Mínimo de 8 caracteres."
                                    />
                                    <Senha
                                        id="confirmarSenha"
                                        name="confirmarSenha"
                                        rotulo="Confirmar nova senha"
                                    />
                                </>
                            )}
                            <button type="submit" className="btn-primario w-full">
                                {e.botao}
                                {etapa === 'email' && (
                                    <i className="ph ph-arrow-right" aria-hidden="true" />
                                )}
                            </button>
                            {etapa === 'codigo' && <Reenviar />}
                        </form>
                    </div>
                </main>
            </div>
        </>
    );
}
