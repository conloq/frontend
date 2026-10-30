import { useState } from 'react';
import AppShell from '@/components/AppShell';
import RecipeContent from '@/components/RecipeContent';

export default function Recipe() {
    // o nome da receita só chega depois do GET /recipes/:id
    const [nome, setNome] = useState('Receita');
    return (
        <AppShell title={nome} trail={['Receitas', nome]} back="/recipes">
            <RecipeContent onNome={setNome} />
        </AppShell>
    );
}
