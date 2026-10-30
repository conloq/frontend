import { useRouter } from 'next/router';
import AppShell from '@/components/AppShell';
import TemperatureContent from '@/components/TemperatureContent';

export default function EditTemperature() {
    const router = useRouter();
    return (
        <AppShell
            title="Editar rampa"
            trail={['Receitas', 'Editar rampa']}
            back={router.query.id ? `/recipes/${router.query.id}` : '/recipes'}
        >
            <TemperatureContent />
        </AppShell>
    );
}
