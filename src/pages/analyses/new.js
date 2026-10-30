import { useState } from 'react';
import AppShell from '@/components/AppShell';
import IodineDemoContent from '@/components/IodineDemoContent';

export default function NewAnalysis() {
    const [lendo, setLendo] = useState(false);
    return (
        <AppShell
            title="Teste de iodo"
            trail={[
                'Teste de iodo',
                lendo ? 'Lote 12/03 · Leitura automática' : 'Lote 12/03 · Preparar sessão',
            ]}
        >
            <IodineDemoContent lendo={lendo} onLendo={setLendo} />
        </AppShell>
    );
}
