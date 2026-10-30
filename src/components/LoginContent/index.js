import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { flash, PasswordInput } from '@/components/Feedback';
import { login } from '@/services/auth';

export default function LoginContent() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [enviando, setEnviando] = useState(false);

    const handleLogin = async (event) => {
        event.preventDefault();
        setEnviando(true);
        // Aqui é feita a lógica do login
        const result = await login(email, password);
        if (result.success) {
            router.push('/recipes');
        } else {
            flash('danger', result.message);
            setEnviando(false);
        }
    };

    return (
        <>
            <form id="loginForm" className="flex flex-col gap-5" onSubmit={handleLogin}>
                <label className="field" htmlFor="email">
                    <span className="field-label">E-mail</span>
                    <span className="field-box">
                        <i className="ph ph-envelope-simple" aria-hidden="true" />
                        <input
                            id="email"
                            type="email"
                            name="email"
                            autoComplete="email"
                            placeholder="voce@email.com"
                            required
                            onChange={(e) => setEmail(e.target.value)}
                            value={email}
                        />
                    </span>
                </label>
                <div className="field">
                    <label className="field-label" htmlFor="password">
                        Senha
                    </label>
                    <span className="field-box">
                        <i className="ph ph-lock-simple" aria-hidden="true" />
                        <PasswordInput
                            id="password"
                            name="password"
                            autoComplete="current-password"
                            placeholder="Sua senha"
                            required
                            onChange={(e) => setPassword(e.target.value)}
                            value={password}
                        />
                    </span>
                </div>
                <button type="submit" className="btn-primary mt-2 w-full" disabled={enviando}>
                    Entrar <i className="ph ph-sign-in" aria-hidden="true" />
                </button>
            </form>
            <p className="text-center text-muted-foreground">
                Ainda não tem conta?{' '}
                <Link href="/signup" className="font-semibold text-action hover:underline">
                    Criar conta
                </Link>
            </p>
        </>
    );
}
