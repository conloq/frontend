# Migração para Tailwind CSS com Dashboard Responsivo

## Objetivo

Remover completamente o Bootstrap e migrar a interface existente do Sistema MASH para Tailwind CSS, mantendo a stack atual com Express, EJS, Sequelize e MySQL. A interface também será refinada para oferecer uma experiência responsiva em desktop, tablet e mobile.

## Escopo

### Incluído

- Instalação do Tailwind CSS v4 e do pacote oficial de CLI como dependências de desenvolvimento.
- Compilação do CSS de entrada para `public/css/style.css`, arquivo já servido pelo Express.
- Detecção das classes usadas em `views/**/*.ejs` e `public/js/**/*.js`.
- Remoção dos CDNs de Bootstrap do `views/partials/header.ejs` e `views/partials/footer.ejs`.
- Remoção de classes Bootstrap e atributos `data-bs-*` de todas as views.
- Conversão das páginas existentes para utilitários Tailwind.
- Sidebar compartilhada com:
  - estado expandido e recolhido no desktop;
  - ícones e textos quando expandida;
  - somente ícones quando recolhida;
  - indicação visual da rota ativa.
- Navegação mobile com drawer lateral, overlay e controle por teclado.
- Substituição dos modais Bootstrap por modais controlados pelo JavaScript existente, sem adicionar biblioteca de componentes.
- Ajustes de layout, tipografia, espaçamento, formulários, cards, tabelas e botões para responsividade.
- Preservação dos fluxos existentes de login, cadastro, perfil, upload de foto, receitas, temperatura e iodo.
- Comandos npm para compilação única e observação contínua do CSS.

### Fora do escopo

- Migração para Next.js, React ou TypeScript.
- Uso de shadcn/ui.
- Alteração de rotas, controllers, modelos Sequelize, associações ou regras de negócio.
- Alteração do banco de dados ou das credenciais existentes.
- Adição de bibliotecas de ícones, modal ou componentes.
- Redesign completo da identidade visual ou troca das imagens existentes.

## Arquitetura de estilos

O projeto continuará servindo arquivos estáticos por meio de `express.static('public')`. O Tailwind será usado somente no processo de build, sem runtime no navegador.

O arquivo de entrada CSS deverá importar Tailwind com a sintaxe da versão 4:

```css
@import "tailwindcss";
```

O mesmo arquivo poderá conter apenas variáveis e regras customizadas que não sejam adequadamente expressas por utilitários Tailwind. A detecção de fontes deverá incluir explicitamente as views EJS e os scripts relevantes por meio de `@source`, evitando depender de heurísticas não verificáveis para arquivos de template.

A saída compilada continuará sendo `public/css/style.css`, portanto o caminho referenciado pelo layout não mudará.

Os comandos esperados serão equivalentes a:

```json
{
  "scripts": {
    "build:css": "npx @tailwindcss/cli -i public/css/tailwind.css -o public/css/style.css",
    "watch:css": "npx @tailwindcss/cli -i public/css/tailwind.css -o public/css/style.css --watch"
  }
}
```

A versão final dos comandos deve usar as versões instaladas no `package.json` e manter o fluxo npm existente.

## Direção visual

A interface seguirá a direção **Dashboard compacto**, com a paleta já presente no projeto:

- marrom escuro para barras superiores e elementos de identidade;
- laranja para ações primárias e estado ativo;
- fundo cinza claro para áreas de trabalho;
- superfícies brancas para cards e formulários;
- tipografia legível com hierarquia clara.

A melhoria visual deve priorizar consistência, leitura e densidade adequada, sem introduzir efeitos decorativos desnecessários.

## Navegação compartilhada

### Desktop

- A sidebar ficará visível em telas grandes.
- O estado expandido exibirá logo, ícones e rótulos.
- O estado recolhido reduzirá a largura e manterá os ícones com `aria-label` e tooltip nativo ou texto acessível.
- O botão de alternância terá `aria-expanded` e `aria-controls`.
- A largura do conteúdo será recalculada pelo layout, sem margens fixas que causem overflow.

### Mobile

- A sidebar fixa será substituída por uma barra superior.
- Um botão hambúrguer abrirá o drawer lateral.
- O drawer terá foco visual, overlay e botão de fechamento.
- O drawer fechará com botão, clique no overlay, tecla `Escape` ou seleção de um link.
- A navegação não deverá bloquear o conteúdo quando fechada.
- O conteúdo principal usará uma única coluna e espaçamento lateral adaptável.

## Modais

Os modais de alteração de foto e criação de processo serão mantidos semanticamente como diálogos, mas sem dependência do Bootstrap.

Cada modal deverá:

- iniciar fechado;
- ser aberto pelo botão correspondente;
- ser fechado pelo botão de cancelar/fechar;
- ser fechado com `Escape`;
- impedir interação visual com o conteúdo de fundo enquanto aberto;
- ter `role="dialog"`, `aria-modal="true"` e título associado;
- permanecer utilizável em telas estreitas.

O JavaScript deverá ser protegido contra elementos ausentes, pois nem todas as páginas renderizam todos os controles.

## Responsividade por tela

- Login e cadastro: duas colunas em telas amplas e fluxo vertical em telas menores.
- Perfil: cartão de usuário e informações reorganizados em coluna no mobile.
- Receita: cabeçalho e ações adaptados; colunas menos importantes poderão ser ocultadas ou reorganizadas em telas estreitas sem perder dados essenciais.
- Formulários de temperatura e iodo: grids de múltiplas colunas no desktop e uma coluna no mobile.
- Botões e campos: largura disponível, altura confortável e áreas de toque acessíveis.
- Imagens: dimensionamento responsivo sem distorção ou overflow.
- Nenhuma página deverá exigir rolagem horizontal para acessar controles principais.

## Compatibilidade e preservação

A migração deve preservar:

- todas as URLs e métodos HTTP existentes;
- o middleware de autenticação por sessão;
- os nomes dos campos dos formulários;
- os destinos dos formulários;
- o upload de imagem e suas restrições atuais;
- os scripts de edição de perfil, seleção de navegação e preview de foto;
- os partials EJS compartilhados.

Não será feita alteração em controllers, modelos ou associações, salvo se uma correção estritamente necessária para a renderização for identificada durante a implementação e aprovada separadamente.

## Verificação

A mudança será considerada concluída somente quando:

1. A compilação do Tailwind finalizar sem erro.
2. Nenhuma view contiver referência a Bootstrap, `data-bs-*` ou classes Bootstrap.
3. O CSS compilado existir em `public/css/style.css` e ser referenciado pelo layout.
4. Os arquivos JavaScript alterados passarem por validação de sintaxe.
5. As views EJS puderem ser carregadas sem erro de template.
6. A sidebar funcionar expandida e recolhida no desktop.
7. O drawer funcionar no mobile, inclusive fechamento por overlay e `Escape`.
8. Os modais de perfil e receita funcionarem sem Bootstrap.
9. Login, cadastro, perfil, upload, receita, temperatura e iodo mantiverem seus destinos e campos.
10. A interface for inspecionada em pelo menos uma viewport desktop e uma viewport mobile.

A verificação com o servidor completo dependerá de uma instância MySQL local disponível, conforme as restrições documentadas em `AGENTS.md`.

## Critério de aceitação

O sistema deverá iniciar com a mesma aplicação Express, renderizar as mesmas páginas EJS e oferecer a mesma funcionalidade de negócio, mas sem carregar Bootstrap em nenhuma etapa do navegador. A aparência deverá usar Tailwind CSS compilado, com sidebar colapsável no desktop, drawer de navegação no mobile e layouts sem overflow horizontal nas principais telas.
