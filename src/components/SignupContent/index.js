import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Field, flash, PasswordInput } from '@/components/Feedback';
import { mensagemErro } from '@/services/api';
import { signUp } from '@/services/auth';

export default function SignupContent() {
    const router = useRouter();
    const [erroConfirmar, setErroConfirmar] = useState(null);
    const [enviando, setEnviando] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        const { name, email, password, confirmarSenha } = Object.fromEntries(
            new FormData(event.target)
        );
        if (password !== confirmarSenha) {
            setErroConfirmar('As senhas não conferem.');
            return event.target.elements.confirmarSenha.focus();
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
            <form id="formCadastro" className="flex flex-col gap-[18px]" onSubmit={handleSubmit}>
                <label className="campo" htmlFor="nome">
                    <span className="campo-rotulo">Nome completo</span>
                    <span className="campo-caixa">
                        <i className="ph ph-user" aria-hidden="true" />
                        <input
                            id="nome"
                            name="name"
                            autoComplete="name"
                            placeholder="Seu nome"
                            required
                        />
                    </span>
                </label>
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
                <Field name="password" inputId="senha" label="Senha" help="Sem espaços.">
                    <i className="ph ph-lock-simple" aria-hidden="true" />
                    <PasswordInput
                        id="senha"
                        name="password"
                        autoComplete="new-password"
                        placeholder="Crie uma senha"
                        required
                    />
                </Field>
                <Field name="confirmarSenha" label="Confirmar senha" error={erroConfirmar}>
                    <i className="ph ph-lock-simple" aria-hidden="true" />
                    <PasswordInput
                        id="confirmarSenha"
                        autoComplete="new-password"
                        placeholder="Repita a senha"
                        aria-invalid={erroConfirmar ? 'true' : undefined}
                        required
                    />
                </Field>
                <button type="submit" className="btn-primario mt-2 w-full" disabled={enviando}>
                    Criar conta <i className="ph ph-arrow-right" aria-hidden="true" />
                </button>
            </form>
            <p className="text-center text-texto-2">
                Já tem conta?{' '}
                <Link href="/login" className="font-semibold text-acao hover:underline">
                    Entrar
                </Link>
            </p>
        </>
    );
}
