# Codebase Structure

## 1. Mapa de alto nível

| Caminho | Finalidade | Evidência |
|---|---|---|
| `index.js` | Composition root, inicialização e servidor HTTP | `index.js` |
| `config/` | Banco, sessão, upload e associações | `config/*.js` |
| `routes/` | Rotas HTTP e ligação com controllers | `routes/*.js` |
| `middleware/` | Verificação de sessão e locals EJS | `middleware/*.js` |
| `controller/` | Casos de uso HTTP e consultas Sequelize | `controller/*.js` |
| `models/` | Modelos Sequelize | `models/*.js` |
| `services/` | Serviço de bcrypt | `services/bcrypt.js` |
| `views/` | Templates EJS e partials | `views/**/*.ejs` |
| `public/` | CSS, JavaScript, imagens, ícones e uploads | `public/` |
| `package.json` | Manifesto e scripts | `package.json` |
| `docs/` | Documentação e artefatos de análise | scan e arquivos existentes em `docs/` |

## 2. Pontos de entrada

- Entrada principal: `index.js`.
- Script de execução: `npm start`, que chama `nodemon index.js`.
- Routers montados na raiz: `routes/route.js`, `routes/usuarioRoutes.js`, `routes/receitaRoutes.js`.
- Workers, CLI ou jobs secundários: [TODO] não encontrados no scan.

## 3. Limites entre módulos

| Limite | Responsabilidade | Não deve concentrar |
|---|---|---|
| `config/` | Configuração de infraestrutura e associações | Regras de negócio de receitas/usuários |
| `routes/` | URL, método HTTP, middleware e controller | Consultas Sequelize complexas |
| `middleware/` | Controle de sessão e dados compartilhados com views | Persistência de entidades |
| `controller/` | Entrada HTTP, regras atuais, persistência e resposta | [ASK USER] intenção futura de separar serviços/repositórios não está registrada |
| `models/` | Campos e FKs dos modelos Sequelize | Renderização EJS |
| `views/` | Apresentação e formulários | Consultas ao banco |
| `public/` | Comportamento e recursos do navegador | Regras de autorização server-side |

## 4. Organização e nomenclatura

- Organização predominante: por camada, não por feature (`controller`, `models`, `routes`, `views`).
- Controllers usam camelCase: `receitaController.js`, `cadastroController.js`.
- Modelos usam PascalCase em vários casos: `Usuario.js`, `Receita.js`, `Temperatura.js`, `Iodo.js`; `log.js` é uma exceção observada.
- Rotas e campos HTML usam nomes em camelCase ou snake_case conforme o contrato existente.
- Imports usam caminhos relativos e extensão `.js`, compatíveis com ES modules.
- Não foram encontradas configurações de aliases de importação.

## 5. Evidências existentes

- `index.js`
- `package.json`
- `config/`
- `routes/`
- `middleware/`
- `controller/`
- `models/`
- `views/`
- `public/`
- `docs/codebase/.codebase-scan.txt` (scan preservado)

## Evidências

- `index.js`
- `package.json`
- `config/`
- `routes/`
- `controller/`
- `models/`
- `views/`
- `public/`
