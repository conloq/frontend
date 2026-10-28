import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { flash, PasswordInput } from '@/components/Feedback';
import { mensagemErro } from '@/services/api';
import { signIn } from '@/services/auth';

export default function LoginContent() {
    const router = useRouter();
    const [enviando, setEnviando] = useState(false);

    const handleLogin = async (event) => {
        event.preventDefault();
        const { email, password } = Object.fromEntries(new FormData(event.target));
        setEnviando(true);
        try {
            await signIn(email, password);
            router.push('/dashboard');
        } catch (error) {
            flash('danger', mensagemErro(error, 'Não foi possível entrar.'));
            setEnviando(false);
        }
    };

    return (
        <>
            <form id="formLogin" className="flex flex-col gap-5" onSubmit={handleLogin}>
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
                <div className="campo">
                    <label className="campo-rotulo" htmlFor="senha">
                        Senha
                    </label>
                    <span className="campo-caixa">
                        <i className="ph ph-lock-simple" aria-hidden="true" />
                        <PasswordInput
                            id="senha"
                            name="password"
                            autoComplete="current-password"
                            placeholder="Sua senha"
                            required
                        />
                    </span>
                    <Link
                        href="/forgot-password"
                        className="mt-1 self-end text-sm font-semibold text-acao hover:underline"
                    >
                        Esqueceu a senha?
                    </Link>
                </div>
                <button type="submit" className="btn-primario mt-2 w-full" disabled={enviando}>
                    Entrar <i className="ph ph-sign-in" aria-hidden="true" />
                </button>
            </form>
            <p className="text-center text-texto-2">
                Ainda não tem conta?{' '}
                <Link href="/signup" className="font-semibold text-acao hover:underline">
                    Criar conta
                </Link>
            </p>
        </>
    );
}
