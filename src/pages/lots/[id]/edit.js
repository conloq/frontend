import { useState } from 'react';
import AppShell from '@/components/AppShell';
import { LotDetail } from '@/components/LotContent';

export default function EditLot() {
    // o nome do lote só chega depois do GET /lots/:id
    const [nome, setNome] = useState('Lote');
    return (
        <AppShell title={nome} trail={['Lotes', nome]} back="/lots">
            <LotDetail editando onNome={setNome} />
        </AppShell>
    );
}
