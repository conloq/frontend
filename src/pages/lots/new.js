import AppShell from '@/components/AppShell';
import LotsContent from '@/components/LotsContent';

export default function NewLot() {
    return (
        <AppShell title="Lotes" trail={['Lotes', 'Todos os lotes']}>
            <LotsContent form />
        </AppShell>
    );
}
