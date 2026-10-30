import { useRouter } from 'next/router';
import AppShell from '@/components/AppShell';
import { IodineSession } from '@/components/LotContent';

export default function Iodine() {
    const router = useRouter();
    return (
        <AppShell
            title="Preparar leitura"
            trail={['Teste de iodo', 'Preparar sessão']}
            back={`/lots/${router.query.id}`}
        >
            <IodineSession />
        </AppShell>
    );
}
