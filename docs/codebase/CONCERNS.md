# Concerns

## 1. Segurança e autorização

- Várias rotas de mutação não usam `isLogado`, incluindo operações de usuário, receita, temperatura e criação de iodo: `routes/usuarioRoutes.js`, `routes/receitaRoutes.js`.
- Atualizações de `Temperatura` e `Iodo` usam IDs de filhos sem validação consistente da propriedade da receita pai: `controller/receitaController.js`.
- Não há mecanismo de CSRF visível para formulários baseados em sessão: `routes/*.js`, `views/*.ejs`.
- Credenciais MySQL e secret da sessão estão hardcoded: `config/sequelize-config.js`, `config/session.js`.
- Cookie da sessão usa `secure: false`: `config/session.js`.
- Upload salva `file.originalname`, permitindo colisões de nome: `config/multer.js`.

## 2. Bugs e divergências funcionais

- O contrato de temperatura foi corrigido: `views/editarTemperatura.ejs` envia `limiteMaximoTemperatura` e `updateTemperatura` lê esse mesmo campo em `controller/receitaController.js`.
- `views/usuario.ejs` informa limite de upload de 2 MB e aceita WebP, enquanto `config/multer.js` permite 20 MB e rejeita WebP.
- `views/editarIodo.ejs` contém action com barra final, enquanto a rota declarada não contém a barra.
- README usa nomes/porta antigos: `lodo`, views de lodo e porta 3000; implementação usa iodo, views de iodo e porta 8080.

## 3. Consistência e manutenção

- FKs são declaradas nos modelos e novamente em `config/associations.js`, duplicando conhecimento relacional.
- Controllers misturam parsing HTTP, regras de negócio, persistência e respostas.
- Campos da sessão são atualizados manualmente após login, atualização de usuário e upload de foto.
- Tratamento de erro é inconsistente: vários `catch` apenas registram o erro sem resposta explícita.
- `defineTemperatura` executa desativação e ativação sem transação.
- Startup inicia operações assíncronas sem aguardar toda a preparação antes de abrir o servidor.

## 4. Dados e privacidade

- O IP do cliente é enviado para `http://ip-api.com` durante o login: `controller/loginController.js`.
- O objeto completo da sessão é exposto aos templates: `middleware/globalInfoUserMiddleware.js`.
- Política de retenção, base legal e governança desses dados: [TODO].

## 5. Escala e desempenho

- Consultas e regras estão concentradas em controllers; estratégia de paginação/cache: [TODO].
- Não foram encontrados benchmarks, profiling, filas ou cache no scan.
- O login faz uma chamada externa síncrona do ponto de vista do fluxo da requisição antes do redirect, embora falhas sejam capturadas.
- [TODO] Não há evidência suficiente para afirmar gargalos de volume ou N+1 além dos padrões de consulta observados.

## 6. Qualidade e operação

- `npm test` falha intencionalmente por ser placeholder.
- Não há lint, formatter, coverage, CI/CD, containerização ou migrations identificados pelo scan.
- O CSS gerado `public/css/style.css` pode ser sobrescrito pelo build; a fonte é `public/css/tailwind.css`.

## 7. Áreas de maior churn

O scan registrou como áreas de churn recente `package-lock.json`, dois uploads e views de cadastro, com uma alteração registrada para cada item. A interpretação detalhada do histórico: [TODO].

## 8. Questões de intenção

- [ASK USER] Definir prioridade e escopo para corrigir a proteção das rotas mutáveis.
- [ASK USER] Definir política desejada para credenciais, segredo de sessão e configuração por ambiente.
- [ASK USER] Definir se a documentação antiga do README deve ser atualizada para refletir a implementação atual.

## 9. Evidências existentes

- `routes/usuarioRoutes.js`
- `routes/receitaRoutes.js`
- `controller/receitaController.js`
- `config/sequelize-config.js`
- `config/session.js`
- `config/multer.js`
- `controller/loginController.js`
- `middleware/globalInfoUserMiddleware.js`
- `views/editarTemperatura.ejs`
- `views/usuario.ejs`
- `README.md`
- `package.json`
- `docs/codebase/.codebase-scan.txt` (scan preservado)

## Evidências

- `routes/usuarioRoutes.js`
- `routes/receitaRoutes.js`
- `controller/receitaController.js`
- `config/session.js`
- `config/multer.js`
- `controller/loginController.js`
- `views/editarTemperatura.ejs`
- `README.md`
