import AppShell from '@/components/AppShell';
import { AccessHistory } from '@/components/ProfileContent';
export default function History() {
    return (
        <AppShell title="Últimos acessos" trail={['Conta', 'Últimos acessos']} back="/profile">
            <AccessHistory />
        </AppShell>
    );
}
