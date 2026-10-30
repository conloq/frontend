import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Field, flash, PasswordInput } from '@/components/Feedback';
import { mensagemErro } from '@/services/api';
import { signUp } from '@/services/auth';

export default function SignupContent() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [erroConfirmar, setErroConfirmar] = useState(null);
    const [enviando, setEnviando] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (password !== confirmPassword) {
            setErroConfirmar('As senhas não conferem.');
            return event.target.elements.confirmPassword.focus();
        }
        setErroConfirmar(null);
        setEnviando(true);
        try {
            const { data } = await signUp({ name, email, password });
            flash('success', data?.message ?? 'Usuário criado com sucesso.');
            router.push('/login');
        } catch (error) {
            flash('danger', mensagemErro(error, 'Não foi possível cadastrar.'));
            setEnviando(false);
        }
    };

    return (
        <>
            <form id="signupForm" className="flex flex-col gap-[18px]" onSubmit={handleSubmit}>
                <label className="field" htmlFor="name">
                    <span className="field-label">Nome completo</span>
                    <span className="field-box">
                        <i className="ph ph-user" aria-hidden="true" />
                        <input
                            id="name"
                            name="name"
                            autoComplete="name"
                            placeholder="Seu nome"
                            required
                            onChange={(e) => setName(e.target.value)}
                            value={name}
                        />
                    </span>
                </label>
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
                <Field name="password" inputId="password" label="Senha" help="Sem espaços.">
                    <i className="ph ph-lock-simple" aria-hidden="true" />
                    <PasswordInput
                        id="password"
                        name="password"
                        autoComplete="new-password"
                        placeholder="Crie uma senha"
                        required
                        onChange={(e) => setPassword(e.target.value)}
                        value={password}
                    />
                </Field>
                <Field name="confirmPassword" label="Confirmar senha" error={erroConfirmar}>
                    <i className="ph ph-lock-simple" aria-hidden="true" />
                    <PasswordInput
                        id="confirmPassword"
                        autoComplete="new-password"
                        placeholder="Repita a senha"
                        aria-invalid={erroConfirmar ? 'true' : undefined}
                        required
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        value={confirmPassword}
                    />
                </Field>
                <button type="submit" className="btn-primary mt-2 w-full" disabled={enviando}>
                    Criar conta <i className="ph ph-arrow-right" aria-hidden="true" />
                </button>
            </form>
            <p className="text-center text-muted-foreground">
                Já tem conta?{' '}
                <Link href="/login" className="font-semibold text-action hover:underline">
                    Entrar
                </Link>
            </p>
        </>
    );
}
