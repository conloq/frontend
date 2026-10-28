import Link from 'next/link';
import AppShell from '@/components/AppShell';
import { EmptyState } from '@/components/Feedback';

// Análise de iodo: sem rota de análises na API, a tela mostra o estado vazio.
export default function Analysis() {
    return (
        <AppShell title="Análise de iodo" trail={['Teste de iodo', 'Análise']} back="/analyses/new">
            <Link href="/analyses/new" className="btn-voltar self-start max-lg:hidden">
                <i className="ph ph-arrow-left" aria-hidden="true" />
                Teste de iodo
            </Link>
            <h1 className="text-[30px] font-semibold">Análise de iodo</h1>
            <section className="card overflow-hidden" aria-labelledby="tituloCaptura">
                <h2
                    id="tituloCaptura"
                    className="border-b border-linha px-6 py-5 text-lg font-semibold"
                >
                    Captura e resultado
                </h2>
                <EmptyState
                    icon="ph-test-tube"
                    title="Nenhuma captura nesta análise"
                    text="A imagem, a classe e a temperatura da coleta aparecem aqui."
                />
            </section>
        </AppShell>
    );
}
