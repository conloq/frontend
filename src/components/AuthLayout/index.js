import { useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Messages } from '@/components/Feedback';
import { temToken } from '@/services/api';

const CHAMADA = 'Do teste de iodo à fervura';

export default function AuthLayout({ title, children }) {
    const router = useRouter();
    useEffect(() => {
        if (temToken()) router.replace('/recipes');
    }, [router]);

    return (
        <>
            <Head>
                <title>{`${title} · MASH`}</title>
            </Head>
            <div className="flex min-h-screen bg-superficie">
                <section
                    className="relative hidden overflow-hidden bg-mash-brown lg:flex lg:flex-1 lg:flex-col lg:px-[72px] lg:pt-[59vh]"
                    aria-label="Sobre o MASH"
                >
                    <img
                        src="/img/mash-emblema.png"
                        alt=""
                        className="pointer-events-none absolute left-1/2 top-24 w-[min(600px,70%)] -translate-x-1/2 opacity-85"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-mash-brown-dark/0 from-35% to-mash-brown-dark/95 to-70%" />
                    <div className="relative flex max-w-3xl flex-col gap-5">
                        <p className="font-display text-[52px] font-bold leading-tight tracking-tight text-white">
                            {CHAMADA}
                        </p>
                        <p className="max-w-2xl text-lg leading-relaxed text-header-texto-2">
                            Cadastre as rampas de cada receita e registre os testes de iodo de cada
                            lote, com hora e temperatura, para saber quando o mosto pode seguir para
                            a fervura.
                        </p>
                    </div>
                </section>
                <main className="flex w-full flex-col items-center px-6 pb-8 pt-12 lg:w-[864px] lg:shrink-0 lg:justify-between">
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
                            {CHAMADA}
                        </p>
                    </div>
                    <span className="max-lg:hidden" aria-hidden="true" />
                    <div className="flex w-full max-w-[440px] flex-col gap-7">
                        <h1 className="text-[32px] font-bold max-lg:sr-only">{title}</h1>
                        <Messages />
                        {children}
                    </div>
                    <p className="text-[13px] text-texto-2 max-lg:hidden">
                        © 2026 Conloq · FATEC Registro
                    </p>
                </main>
            </div>
        </>
    );
}
