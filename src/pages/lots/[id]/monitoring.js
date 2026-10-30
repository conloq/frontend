import { useRouter } from 'next/router';
import AppShell from '@/components/AppShell';
import { LotMonitoring } from '@/components/LotContent';

export default function Monitoring() {
    const router = useRouter();
    return (
        <AppShell
            title="Monitoramento"
            trail={['Lotes', 'Monitoramento']}
            back={`/lots/${router.query.id}`}
        >
            <LotMonitoring />
        </AppShell>
    );
}
