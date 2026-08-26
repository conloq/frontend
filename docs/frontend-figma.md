# Tokens Visuais e Exportação para Figma

## Tokens observados

### Cores

| Token | Valor | Uso observado |
|---|---|---|
| `mash-brown` | `#3f2a20` | Top bar, títulos e texto de destaque. |
| `mash-orange` | `#d97706` | Ações primárias, foco, destaque ativo e identidade. |
| `mash-cream` | `#f7f3ee` | Fundo base do documento. |
| `stone-100` | Tailwind | Fundo do shell autenticado. |
| `white` | Tailwind | Superfícies de cards, modal e sidebar. |
| `sky-600` | Tailwind | Ação de adicionar temperatura. |
| `amber-500` | Tailwind | Ação de editar temperatura. |
| `red-600` | Tailwind | Ação destrutiva de excluir receita. |

### Tipografia

- Família base declarada: `Inter`, com fallback `ui-sans-serif`, `system-ui`, `sans-serif`.
- Títulos principais usam pesos altos e escala aproximada `text-3xl`.
- Rótulos de tabela usam caixa alta, tamanho reduzido e tracking ampliado.
- Ações primárias usam peso forte e, em alguns formulários, caixa alta.

### Forma e espaçamento

- Cards e modais usam cantos arredondados amplos, principalmente `rounded-2xl` e `rounded-3xl`.
- Controles interativos usam `rounded-lg` ou `rounded-xl`.
- Alvo mínimo adotado para ações icon-only: `min-h-11 min-w-11`.
- Shell autenticado usa padding responsivo `p-4 sm:p-6`.
- Sidebar expandida: 18rem; recolhida: 5rem.

## Plano de exportação para Figma

O projeto não contém um exportador `.fig` nativo. O formato recomendado é preparar as telas para importação no Figma por meio de captura visual e documentação de componentes.

### Fluxo recomendado

1. Executar a aplicação em ambiente local com dados visuais representativos.
2. Capturar cada tela em viewport desktop e mobile.
3. Capturar estados interativos relevantes: modal, sidebar recolhida e drawer aberto.
4. Exportar as capturas como PNG para referência visual.
5. Recriar ou converter as telas em SVG quando for necessário editar elementos no Figma.
6. Importar os SVGs/PNGs no Figma e organizar páginas por tela.
7. Usar este inventário como legenda dos componentes e tokens.

### Organização sugerida no Figma

- `00 — Tokens`: cores, tipografia, espaçamento e raios.
- `01 — Componentes`: sidebar, top bar, botões, campos, cards, tabela e modal.
- `02 — Públicas`: login e cadastro.
- `03 — Autenticadas`: perfil e receitas.
- `04 — Configuração`: temperatura e iodo.
- `05 — Estados`: modais, drawer, sidebar recolhida e estados vazios.

### Limitação importante

PNG preserva aparência, mas não gera camadas editáveis. SVG permite edição após importação, mas pode exigir limpeza e reorganização de grupos no Figma. Um arquivo `.fig` só deve ser produzido por exportação própria do Figma ou por uma ferramenta/plugin compatível; não será inventado manualmente.

## Evidências

- `public/css/tailwind.css`
- `views/receita.ejs`
- `views/partials/sidebar.ejs`
- `views/partials/topBar.ejs`
- `views/partials/header.ejs`
- `public/js/script.js`
