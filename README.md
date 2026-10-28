# Sistema MASH

Frontend do Sistema MASH em Next.js (React, Pages Router) com Tailwind CSS v4. O Back-End (`conloq/Back-End`, porta 8080) mantém as regras, os dados e emite o JWT; este repositório mantém só as telas. Os repositórios seguem separados.

## Como as telas consomem a API

O navegador chama a API direto com `axios` (`src/services/api.js`), como no projeto de referência `front-end-react`. O login (`POST /login`) devolve o JWT, que fica no `localStorage` (`mash_token`). Um interceptor envia `Authorization: Bearer <token>` em toda chamada; um `401` apaga o token e volta para `/login`. Cada tela busca os próprios dados no `useEffect` e renderiza com React, que escapa o conteúdo.

Como a chamada sai do navegador, o Back-End precisa liberar a origem deste frontend no CORS (`FRONTEND_URL`). O frontend não conecta ao banco.

## Executar

```bash
npm install
npm run build:css
npm run dev
```

O frontend roda em `http://localhost:4000`. A API precisa estar de pé em `NEXT_PUBLIC_API_URL` (padrão `http://localhost:8080`); copie `.env.example` para `.env` se precisar mudar. Rode `npm run watch:css` em outro terminal enquanto edita classes.

Produção local: `npm run build` (gera o CSS e o build do Next) e `npm start`.

## Deploy publicado

| Serviço | URL |
|---|---|
| Frontend | <https://frontend-a6u4.onrender.com> |
| API do Back-End | <https://back-end-xxq5.onrender.com> |

No serviço do frontend no Render: `NEXT_PUBLIC_API_URL=https://back-end-xxq5.onrender.com`, Build Command `npm install --include=dev && npm run build`, Start Command `npm start`. A variável `NEXT_PUBLIC_*` entra no build, então mudar a URL exige novo deploy. No Back-End, `FRONTEND_URL` deve ser a URL do frontend.

Para voltar a uma versão anterior, use **Rollback** no histórico de deploys do Render. Isso não desfaz migrations do banco.

## Verificações

- `npm test`: contrato da camada de API (Bearer, 401, rotas de login e usuário) e a validação de rampa, sem API nem banco.
- `npm run lint`: ESLint com a configuração do Next (`eslint.config.mjs`).
- `npm run format:check`: Prettier.
- `npm run build`: compila o CSS e todas as rotas.

## Telas

As rotas ficam em `src/pages/` e o conteúdo de cada tela em `src/components/`. Login, cadastro, perfil, receitas e rampas usam a API real. Painel, lotes, sessão do iodo, recuperação de senha e análise detalhada mostram estados vazios enquanto a API não tem essas rotas. `/analyses/new` é a simulação do teste de iodo para o pitch.

Consulte `codemap.md`, `AGENTS.md` e `docs/codebase/` para os mapas e convenções do projeto.
