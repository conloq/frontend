import { useRouter } from 'next/router';
import AppShell from '@/components/AppShell';
import TemperatureContent from '@/components/TemperatureContent';

export default function NewTemperature() {
    const router = useRouter();
    return (
        <AppShell
            title="Nova rampa"
            trail={['Receitas', 'Nova rampa']}
            back={router.query.id ? `/recipes/${router.query.id}` : '/recipes'}
        >
            <TemperatureContent />
        </AppShell>
    );
}
