# Technology Stack

## 1. Runtime Summary

| Área | Valor | Evidência |
|---|---|---|
| Linguagem principal | JavaScript | `package.json`, `index.js`, `controller/*.js` |
| Runtime | Node.js; versão exata não declarada | `package.json` não contém `.nvmrc`/campo de versão registrado no scan |
| Gerenciador de pacotes | npm | `package.json`, `package-lock.json` |
| Módulos/build | ES modules (`"type": "module"`); Tailwind CSS v4 via CLI | `package.json`, `public/css/tailwind.css`, scripts do manifesto |

## 2. Frameworks e dependências de produção

| Dependência | Versão | Papel | Evidência |
|---|---|---|---|
| Express | 5.x conforme manifesto/scan | Servidor HTTP e roteamento | `package.json`, `index.js` |
| EJS | Declarada no manifesto | Renderização server-side | `package.json`, `index.js`, `views/` |
| Sequelize | 6.x conforme manifesto/scan | ORM, conexão e sincronização MySQL | `package.json`, `config/sequelize-config.js`, `models/` |
| mysql2 | Declarada no manifesto | Driver MySQL | `package.json` |
| express-session | Declarada no manifesto | Sessões HTTP | `package.json`, `config/session.js` |
| connect-session-sequelize | Declarada no manifesto | Persistência de sessões no Sequelize | `package.json`, `config/session.js` |
| bcrypt | Declarada no manifesto | Hash/comparação de senhas | `package.json`, `services/bcrypt.js` |
| Multer | Declarada no manifesto | Upload de imagens | `package.json`, `config/multer.js` |
| Phosphor Icons | `@phosphor-icons/web` declarada | Ícones servidos estaticamente | `package.json`, `index.js`, `views/partials/header.ejs` |

## 3. Ferramentas de desenvolvimento

| Ferramenta | Finalidade | Evidência |
|---|---|---|
| Nodemon | Execução de desenvolvimento | Script `start` em `package.json` |
| Tailwind CSS CLI | Compilação e watch do CSS | Scripts `build:css`/`watch:css` em `package.json` |
| `node --check` | Verificação sintática pontual | `AGENTS.md`; executado nos arquivos JS alterados |
| EJS instalado | Compilação/verificação de templates | `package.json`, `AGENTS.md` |
| Linter/formatter | Não configurado | Scan sem configuração de lint/format |

## 4. Comandos principais

```bash
npm install
npm start
npm run build:css
npm run watch:css
npm test
```

`npm test` é um placeholder que termina com erro intencionalmente. Não há suíte de testes implementada.

## 5. Ambiente e configuração

- Configuração principal: `config/sequelize-config.js`, `config/data-base.js`, `config/session.js`, `config/multer.js`.
- Variáveis de ambiente documentadas: [TODO] nenhuma fonte `.env.example`/`.env.template` foi encontrada pelo scan.
- Banco esperado: MySQL local, banco `cervejaria`.
- Servidor HTTP: porta `8080` em `index.js`.
- Deploy/container/CI: [TODO] o scan não encontrou configuração de CI/CD, container ou orquestração.
- Credenciais e segredo de sessão estão hardcoded nos arquivos de configuração atuais.

## 6. Evidências existentes

- `package.json`
- `package-lock.json`
- `index.js`
- `config/sequelize-config.js`
- `config/session.js`
- `config/multer.js`
- `public/css/tailwind.css`
- `AGENTS.md`
- `docs/codebase/.codebase-scan.txt` (scan preservado)

## Evidências

- `package.json`
- `index.js`
- `config/sequelize-config.js`
- `config/session.js`
- `config/multer.js`
- `public/css/tailwind.css`
