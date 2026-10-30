import AppShell from '@/components/AppShell';
import LotsContent from '@/components/LotsContent';

export default function Lots() {
    return (
        <AppShell title="Lotes" trail={['Lotes', 'Todos os lotes']}>
            <LotsContent />
        </AppShell>
    );
}
