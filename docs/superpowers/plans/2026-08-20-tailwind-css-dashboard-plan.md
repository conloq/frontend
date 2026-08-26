# Migração para Tailwind CSS com Dashboard Responsivo — Plano de Implementação

> **Para agentes de implementação:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recomendado) ou `superpowers:executing-plans` para executar este plano tarefa por tarefa. Use caixas de seleção (`- [ ]`) para acompanhar as etapas.

**Objetivo:** Remover Bootstrap do Sistema MASH e migrar todas as views EJS para Tailwind CSS v4 compilado, preservando a stack Express/EJS e os fluxos existentes, com sidebar colapsável no desktop e drawer responsivo no mobile.

**Arquitetura:** O Express continuará servindo `public` estaticamente. O Tailwind será usado apenas em build-time através da CLI oficial: `public/css/tailwind.css` será a fonte, `public/css/style.css` continuará sendo a saída servida pelo layout, e `@source` apontará explicitamente para `views/**/*.ejs` e `public/js/**/*.js`. A navegação compartilhada ficará nos partials EJS e o comportamento de sidebar, drawer e modais será implementado no JavaScript vanilla já existente, sem novas bibliotecas.

**Stack:** Node.js ES modules, Express 5, EJS 5, Tailwind CSS v4, `@tailwindcss/cli`, JavaScript vanilla, CSS compilado servido por `express.static('public')`.

## Restrições globais

- Manter Express, EJS, Sequelize, MySQL, sessões, rotas, controllers, modelos, associações e regras de negócio atuais.
- Remover completamente Bootstrap: CDN, classes Bootstrap, atributos `data-bs-*` e dependência funcional de Bootstrap JS/CSS.
- Usar Tailwind CSS v4 e a CLI oficial; não usar PostCSS, Next.js, React, TypeScript, shadcn/ui ou novas bibliotecas de ícones/modal/componentes.
- A entrada será `public/css/tailwind.css`; a saída será `public/css/style.css`.
- As fontes Tailwind deverão incluir explicitamente `views/**/*.ejs` e `public/js/**/*.js` com `@source`.
- Preservar URLs, métodos HTTP, nomes de campos, destinos de formulários, autenticação por sessão e upload JPEG/JPG/PNG até 20 MB.
- Não alterar controllers, modelos ou associações; qualquer correção de renderização que exija isso deve ser interrompida e aprovada separadamente.
- Manter a paleta existente: marrom escuro, laranja, cinza claro e branco; priorizar clareza, densidade adequada e acessibilidade.
- Não editar `node_modules/` nem versionar artefatos gerados ou uploads.
- O servidor completo requer MySQL local; quando isso não estiver disponível, usar verificações isoladas de build, sintaxe e renderização.

## Arquivos e responsabilidades

- Criar `public/css/tailwind.css`: entrada Tailwind v4, fontes explícitas e somente regras-base/customizações realmente necessárias.
- Modificar `package.json`: scripts `build:css`/`watch:css` e dependências de desenvolvimento da CLI.
- Modificar `package-lock.json`: refletir a instalação reproduzível das dependências, sem edição manual.
- Modificar `views/partials/header.ejs`: remover CDN Bootstrap, manter viewport e stylesheet compilado, definir estrutura global necessária.
- Modificar `views/partials/footer.ejs`: remover Bootstrap JS e manter apenas scripts próprios necessários.
- Modificar `views/partials/sidebar.ejs`: criar navegação compartilhada com estados expandido/recolhido, rota ativa, atributos acessíveis e compatibilidade com drawer mobile.
- Modificar `views/partials/topBar.ejs`: criar barra superior desktop/mobile, alternância da sidebar, hambúrguer, fechamento do drawer e ações existentes.
- Modificar `views/login.ejs` e `views/cadastro.ejs`: converter formulários e layout de autenticação para utilitários Tailwind, com duas colunas em telas amplas e coluna única em telas estreitas.
- Modificar `views/usuario.ejs`: converter perfil, upload e modal de alteração de foto para Tailwind e diálogo vanilla acessível.
- Modificar `views/receita.ejs`: converter tabela/cards, ações e modal de criação de processo para Tailwind e diálogo vanilla acessível.
- Modificar `views/adicionarTemperatura.ejs` e `views/editarTemperatura.ejs`: converter formulários para grid responsivo.
- Modificar `views/adicionarIodo.ejs` e `views/editarIodo.ejs`: converter formulários para grid responsivo.
- Modificar `views/index.ejs`: converter a página existente sem alterar seu fluxo.
- Modificar `public/js/script.js`: tornar consultas DOM tolerantes a páginas sem certos elementos e implementar sidebar desktop, drawer mobile, Escape, overlay, fechamento por link, modais e preview de foto.
- Remover ou substituir `public/css/reset.css` e o conteúdo legado de `public/css/style.css` somente depois que todas as views deixarem de depender deles; `style.css` deve terminar como saída compilada, não como fonte manual.

---

### Tarefa 1: Configurar o pipeline Tailwind v4

**Arquivos:**
- Criar: `public/css/tailwind.css`
- Modificar: `package.json`
- Modificar gerado pelo npm: `package-lock.json`
- Preservar como saída: `public/css/style.css`

**Interfaces:**
- Produz o comando `npm run build:css`, que compila `public/css/tailwind.css` em `public/css/style.css`.
- Produz o comando `npm run watch:css`, que repete a mesma compilação em modo watch.
- A entrada deve expor as classes encontradas nas views EJS e scripts JS via `@source`.

- [ ] **Passo 1: Adicionar a configuração mínima da entrada CSS**

```css
@import "tailwindcss" source(none);
@source "../../views";
@source "../js";
```

Use caminhos relativos ao arquivo `public/css/tailwind.css`. Não copie o CSS legado para a entrada; adicione regras customizadas apenas se uma necessidade concreta permanecer após a conversão das views.

- [ ] **Passo 2: Adicionar scripts e dependências de desenvolvimento**

Acrescente os scripts sem remover `start` nem modificar o script `test` existente:

```json
"build:css": "npx @tailwindcss/cli -i public/css/tailwind.css -o public/css/style.css",
"watch:css": "npx @tailwindcss/cli -i public/css/tailwind.css -o public/css/style.css --watch"
```

Instale as versões compatíveis atuais de `tailwindcss` e `@tailwindcss/cli` como `devDependencies` usando npm, permitindo que o npm atualize `package-lock.json`.

- [ ] **Passo 3: Compilar a primeira saída**

Execute:

```bash
npm run build:css
```

Esperado: o comando termina sem erro e cria/atualiza `public/css/style.css`.

- [ ] **Passo 4: Confirmar que a saída é gerada pelo Tailwind**

Verifique que `public/css/style.css` contém regras utilitárias Tailwind e não depende de um stylesheet Bootstrap externo. Não adicione manualmente o arquivo gerado ao plano de edição.

---

### Tarefa 2: Remover Bootstrap dos partials e estruturar o shell responsivo

**Arquivos:**
- Modificar: `views/partials/header.ejs`
- Modificar: `views/partials/footer.ejs`
- Modificar: `views/partials/sidebar.ejs`
- Modificar: `views/partials/topBar.ejs`

**Interfaces:**
- Todos os layouts autenticados continuam incluindo os mesmos partials EJS.
- `sidebar.ejs` deve expor um elemento com id estável para `aria-controls` e uma navegação com links identificáveis.
- `topBar.ejs` deve expor controles identificáveis para alternar/recolher no desktop, abrir no mobile e fechar o drawer.
- O layout deve reservar o espaço do conteúdo pelo próprio flex/grid do shell, nunca por margens fixas conflitantes.

- [ ] **Passo 1: Remover os carregamentos Bootstrap**

No `header.ejs`, remova o `<link>` CDN Bootstrap e mantenha `<link rel="stylesheet" href="/css/style.css">`. No `footer.ejs`, remova o `<script>` CDN Bootstrap e preserve `/js/script.js` com `defer` ou no ponto atual compatível com o markup.

- [ ] **Passo 2: Converter a sidebar compartilhada**

Substitua `col-*`, `row`, `gx-*`, `d-grid` e demais classes Bootstrap por `flex`, `gap`, `w-*`, `min-h-*`, `transition-*` e variantes responsivas Tailwind. Preserve os caminhos atuais, incluindo `/receita`; não transforme links `#` em novas funcionalidades.

O shell deve suportar:

```html
<aside id="app-sidebar" aria-label="Navegação principal">
  <button id="sidebar-toggle" type="button" aria-controls="app-sidebar" aria-expanded="true">...</button>
  <nav>...</nav>
</aside>
```

Os ícones existentes em `/icons/*.png` devem continuar sendo usados. Quando recolhida, os rótulos podem ser visualmente ocultos, mas cada link deve manter nome acessível por texto, `aria-label` ou tooltip nativo.

- [ ] **Passo 3: Criar a barra superior e controles mobile**

Adicionar botão hambúrguer com `aria-controls`/`aria-expanded`, botão de fechar do drawer e overlay com id estável. O drawer deve ficar fora do fluxo principal quando fechado e não bloquear o conteúdo fora do breakpoint mobile.

- [ ] **Passo 4: Compilar e procurar resíduos**

Execute `npm run build:css` e pesquise em `views/` por `bootstrap`, `data-bs-`, `container-fluid`, `row`, `col-`, `btn`, `form-control`, `modal` e demais tokens Bootstrap. Nesta etapa, aceite somente ocorrências que ainda pertençam a telas não convertidas; registre-as para as tarefas seguintes.

---

### Tarefa 3: Converter autenticação e páginas básicas

**Arquivos:**
- Modificar: `views/login.ejs`
- Modificar: `views/cadastro.ejs`
- Modificar: `views/index.ejs`

**Interfaces:**
- Manter exatamente os `action`, `method`, nomes dos inputs, mensagens EJS e destinos atuais.
- Os formulários devem permanecer submetíveis sem JavaScript.
- O layout deve usar duas colunas em telas amplas e uma coluna em telas menores, sem rolagem horizontal.

- [ ] **Passo 1: Catalogar os campos e destinos existentes**

Antes de editar, registre no próprio trabalho de implementação os atributos atuais de cada `<form>`, `<input>`, `<select>` e `<button>`. Não substitua nomes de campos por nomes “mais claros”.

- [ ] **Passo 2: Converter o layout sem alterar o contrato HTTP**

Troque classes Bootstrap por utilitários Tailwind para `min-h-screen`, `grid`, `lg:grid-cols-2`, `gap`, `max-w`, `w-full`, `rounded`, `border`, `focus:*`, `disabled:*` e espaçamento responsivo. Use `type`, `autocomplete`, `label` e mensagens existentes.

- [ ] **Passo 3: Garantir acessibilidade mínima dos formulários**

Cada controle deve ter label associado, foco visível, texto legível e área de toque confortável. Mensagens de erro/sucesso existentes devem manter conteúdo e posição próxima ao controle ou formulário correspondente.

- [ ] **Passo 4: Verificar markup EJS e CSS**

Execute:

```bash
npm run build:css
node --check public/js/script.js
```

Depois renderize as rotas de autenticação com o mecanismo existente ou, se o MySQL impedir a inicialização, faça inspeção estática dos arquivos e registre a limitação sem alterar a aplicação para contorná-la.

---

### Tarefa 4: Converter perfil, receita e diálogos vanilla

**Arquivos:**
- Modificar: `views/usuario.ejs`
- Modificar: `views/receita.ejs`
- Modificar: `public/js/script.js`

**Interfaces:**
- Preservar upload, formulários, URLs, métodos, nomes de campos e dados EJS.
- Os controles devem usar IDs/classes estáveis para o JavaScript, sem `data-bs-toggle`, `data-bs-target` ou `data-bs-dismiss`.
- O script deve funcionar quando um modal, formulário ou preview não existir na página atual.

- [ ] **Passo 1: Converter o perfil e o upload**

Preserve o formulário de foto e sua ação atual. Use imagem responsiva com `max-w-full`/`object-cover`, cartões com superfícies brancas e controles que se reorganizem em coluna em telas estreitas.

- [ ] **Passo 2: Converter o modal de foto para diálogo acessível**

O modal deve iniciar oculto, ter `role="dialog"`, `aria-modal="true"`, `aria-labelledby` apontando para seu título, botão de fechar/cancelar e área de fundo bloqueada visualmente. Use classes Tailwind para overlay e painel responsivo; não use biblioteca externa.

- [ ] **Passo 3: Converter receita, ações e modal de processo**

Preserve todas as colunas/dados essenciais e ações atuais. Faça a tabela ou composição equivalente caber em mobile; esconda/reorganize somente informação não essencial, sem remover dados necessários à operação. O modal de criação de processo deve seguir os mesmos requisitos semânticos do modal de foto.

- [ ] **Passo 4: Implementar comportamento vanilla tolerante**

No `public/js/script.js`, use consultas com verificação de existência antes de registrar listeners. O comportamento mínimo deve incluir:

```js
function closeDialog(dialog) {
  if (!dialog) return;
  dialog.hidden = true;
}

function handleEscape(event) {
  if (event.key !== 'Escape') return;
  closeDialog(document.querySelector('[role="dialog"]:not([hidden])'));
  closeDrawer();
}
```

Adapte os nomes aos IDs reais do markup e mantenha as funções existentes de edição de perfil, active sidebar e preview de foto. O script deve abrir/fechar cada diálogo pelo botão correspondente, pelo cancelamento, pelo overlay e por `Escape`, sem quebrar páginas onde o elemento não é renderizado.

- [ ] **Passo 5: Verificar o comportamento isolado**

Execute:

```bash
node --check public/js/script.js
npm run build:css
```

Se o servidor estiver disponível, exercite os controles no navegador em desktop e mobile; caso contrário, use inspeção DOM estática e registre que a verificação interativa depende do MySQL.

---

### Tarefa 5: Converter formulários de temperatura, iodo e demais telas autenticadas

**Arquivos:**
- Modificar: `views/adicionarTemperatura.ejs`
- Modificar: `views/editarTemperatura.ejs`
- Modificar: `views/adicionarIodo.ejs`
- Modificar: `views/editarIodo.ejs`

**Interfaces:**
- Preservar `action`, `method`, nomes de campos, valores EJS e mensagens existentes.
- Os formulários devem usar grid de múltiplas colunas no desktop e uma coluna no mobile.
- Nenhum controle principal pode exigir rolagem horizontal.

- [ ] **Passo 1: Catalogar contratos dos quatro formulários**

Leia cada formulário e mantenha seus contratos HTTP exatamente. Não mova lógica para controllers ou models.

- [ ] **Passo 2: Converter campos e ações**

Use `grid`, `md:grid-cols-*`, `gap-*`, `w-full`, `min-w-0`, `rounded`, `border`, estados de foco e botões responsivos. Mantenha labels e tipos nativos dos inputs para aproveitar validação do navegador.

- [ ] **Passo 3: Converter mensagens e estados**

Mantenha alertas e mensagens de validação visualmente associados ao formulário, usando classes semânticas e acessíveis sem depender de componentes Bootstrap.

- [ ] **Passo 4: Recompilar e validar sintaxe**

Execute `npm run build:css`, `node --check public/js/script.js` e uma busca por classes Bootstrap remanescentes nas quatro views.

---

### Tarefa 6: Remover CSS legado e fechar a migração visual

**Arquivos:**
- Modificar: `public/css/tailwind.css`
- Substituir pela saída de build: `public/css/style.css`
- Remover somente se não houver referência: `public/css/reset.css`
- Modificar, se necessário: views e `public/js/script.js` para classes finais

**Interfaces:**
- `style.css` deve ser sempre regenerável com `npm run build:css`.
- Nenhuma view pode depender de classes definidas apenas no antigo CSS customizado ou no Bootstrap.
- O layout visual deve conservar a direção “Dashboard compacto”.

- [ ] **Passo 1: Encontrar dependências do CSS legado**

Pesquise classes customizadas usadas em `views/` e compare com `public/css/style.css`/`reset.css`. Para cada classe, substitua a ocorrência por utilitários Tailwind ou mova apenas a regra essencial para `tailwind.css`. Não recrie o stylesheet legado inteiro.

- [ ] **Passo 2: Remover imports e arquivos não utilizados**

Garanta que nenhum partial ou view referencie `reset.css`. Remova o arquivo somente depois de confirmar que não há referências e que a compilação continua reproduzindo o layout. Não remova imagens ou ícones existentes.

- [ ] **Passo 3: Fazer a compilação final**

Execute:

```bash
npm run build:css
```

Confirme que `public/css/style.css` existe e que o `header.ejs` o referencia.

- [ ] **Passo 4: Rodar a varredura final de Bootstrap**

Execute uma busca recursiva em `views/` e `public/` por:

```text
bootstrap
Bootstrap
data-bs-
container-fluid
form-control
btn-primary
btn-secondary
modal-dialog
row
col-
```

A busca final não deve encontrar CDN, `data-bs-*` ou classes Bootstrap em markup/JavaScript. Analise falsos positivos em nomes de arquivos ou texto antes de concluir.

---

### Tarefa 7: Verificação de regressão e responsividade

**Arquivos:**
- Nenhuma alteração esperada; corrigir somente regressões encontradas nas tarefas anteriores.

**Interfaces:**
- A aplicação continua inicializando como antes, com a única mudança funcional de apresentação e navegação client-side.
- Rotas e contratos de negócio permanecem inalterados.

- [ ] **Passo 1: Validar build, JavaScript e dependências**

Execute:

```bash
npm run build:css
node --check public/js/script.js
npm ls tailwindcss @tailwindcss/cli --depth=0
```

Esperado: build sem erro, sintaxe válida e os dois pacotes instalados como dependências de desenvolvimento.

- [ ] **Passo 2: Validar os arquivos EJS sem banco quando possível**

Use a forma mais estreita disponível no projeto para carregar/compilar os templates EJS. Se a inicialização do `index.js` exigir MySQL indisponível, não crie mock permanente nem altere credenciais; registre “bloqueado por MySQL local” e valide sintaxe/estrutura estática das views.

- [ ] **Passo 3: Exercitar o servidor completo quando MySQL estiver disponível**

Execute `npm start`, confirme que o processo escuta na porta 8080 e verifique pelo menos:

- GET `/` renderiza login.
- GET `/cadastro` renderiza cadastro.
- Rotas autenticadas continuam protegidas.
- `/receita`, temperatura e iodo preservam formulários e destinos.
- Perfil mantém edição, upload e preview.

Pare o servidor após a verificação.

- [ ] **Passo 4: Inspecionar duas viewports**

Em uma viewport desktop, verificar sidebar expandida, recolhida, indicador ativo e recálculo do conteúdo. Em uma viewport mobile, verificar barra superior, abertura do drawer, overlay, fechamento por botão, link e `Escape`, além da ausência de overflow horizontal principal.

- [ ] **Passo 5: Verificar diálogos**

Confirmar que os dois diálogos iniciam fechados, abrem pelos controles, fecham por cancelar/fechar, overlay e `Escape`, mantêm foco visual no painel e exibem `role="dialog"`, `aria-modal="true"` e título associado.

- [ ] **Passo 6: Conferir preservação de escopo**

Use `git diff --stat` e `git diff` para confirmar que alterações estão limitadas a pipeline CSS, views, partials, JavaScript e lockfile. Rejeite alterações em rotas, controllers, modelos, associações, banco, credenciais, uploads ou regras de negócio.

## Critérios de conclusão

A implementação só pode ser declarada concluída quando:

1. `npm run build:css` termina sem erro.
2. `public/css/style.css` existe e é referenciado pelo layout.
3. Nenhuma view carrega Bootstrap ou usa `data-bs-*`/classes Bootstrap.
4. `node --check public/js/script.js` passa.
5. Os templates EJS carregam ou a limitação de MySQL local está explicitamente registrada.
6. Sidebar desktop expande/recolhe e mantém acessibilidade.
7. Drawer mobile abre/fecha por botão, overlay, link e `Escape`.
8. Diálogos de perfil e receita funcionam sem Bootstrap.
9. Login, cadastro, perfil, upload, receita, temperatura e iodo preservam contratos e destinos.
10. Desktop e mobile não apresentam overflow horizontal nos controles principais.
11. O diff não contém mudanças fora do escopo aprovado.

## Auto-revisão do plano

- **Cobertura da especificação:** pipeline Tailwind (Tarefa 1), remoção de Bootstrap e shell (Tarefa 2), autenticação (Tarefa 3), perfil/receita/modais (Tarefa 4), temperatura/iodo (Tarefa 5), limpeza CSS (Tarefa 6), verificação completa (Tarefa 7).
- **Placeholders:** não há etapas “TBD”, “TODO” ou lógica omitida; limitações ambientais são tratadas como resultado explícito de verificação.
- **Consistência:** todos os caminhos usam `public/css/tailwind.css` → `public/css/style.css`; o JavaScript vanilla é a única camada de comportamento para navegação e diálogos; nenhum task altera backend.
- **Risco conhecido:** a compilação Tailwind pode exigir ajuste de caminhos `@source` conforme o diretório de trabalho da CLI. A primeira compilação da Tarefa 1 deve confirmar o caminho; se falhar, corrigir somente os caminhos relativos da entrada CSS com base no erro real.
