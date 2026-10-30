import AppShell from '@/components/AppShell';
import ProfileContent from '@/components/ProfileContent';

export default function Profile() {
    return (
        <AppShell title="Perfil" trail={['Conta', 'Perfil']}>
            <ProfileContent />
        </AppShell>
    );
}
