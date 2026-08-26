# Figma export bundle

Pacote frontend-only para importar referências visuais no Figma.

## Conteúdo

- `manifest.json`: inventário das telas e estados, com fonte e status de captura.
- `tokens.md`: tokens visuais observados no frontend.
- `screens/login.svg`: referência editável da tela pública observada no portal Maestri em 1140 × 695 px.
- `screens/cadastro-authenticated-session.png`: referência capturada da tela de cadastro.
- `screens/usuario-authenticated.png`: captura autenticada da tela de perfil.
- `screens/receita-authenticated.png`: captura autenticada da tela de receitas.
- `screens/`: telas de configuração ainda são capturadas sob demanda quando o portal está renderizando.

## Como importar no Figma

1. Arraste um arquivo `.svg` para um canvas do Figma.
2. Use `Ungroup` somente se precisar editar camadas individualmente.
3. Use o SVG como referência de composição; ele não substitui a renderização real com dados.
4. Para fidelidade de pixels, capture PNG pelo portal após autenticar com uma conta de teste fornecida pelo usuário.

## Limitações

- Não há exportador nativo `.fig` neste projeto.
- Telas autenticadas dependem de sessão e registros reais; nenhuma credencial foi inventada.
- Este pacote não altera rotas, controllers, models, middleware, configuração ou banco.
