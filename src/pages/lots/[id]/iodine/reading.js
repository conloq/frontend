import { useRouter } from 'next/router';
import AppShell from '@/components/AppShell';
import { IodineSession } from '@/components/LotContent';

export default function IodineReading() {
    const router = useRouter();
    return (
        <AppShell
            title="Leitura do iodo"
            trail={['Teste de iodo', 'Leitura automática']}
            back={`/lots/${router.query.id}`}
        >
            <IodineSession leitura />
        </AppShell>
    );
}
