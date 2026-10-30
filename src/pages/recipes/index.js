import AppShell from '@/components/AppShell';
import RecipesContent from '@/components/RecipesContent';

export default function Recipes() {
    return (
        <AppShell title="Receitas" trail={['Receitas', 'Todas as receitas']}>
            <RecipesContent />
        </AppShell>
    );
}
