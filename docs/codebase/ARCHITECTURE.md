# Arquitetura

## Fluxo

```text
navegador (Next.js, :4000) --axios + Authorization: Bearer--> Back-End REST (:8080)
   |-- POST /login -> JWT no localStorage (mash_token)
   |-- AppShell: GET /user antes de cada tela logada
   |-- telas: GET/POST/PUT/DELETE no useEffect ou no envio do formulário
   |-- 401 -> apaga o token -> /login
```

O frontend e o Back-End continuam em repositórios separados. O Next.js (Pages Router) serve as páginas; cada arquivo de `src/pages/` monta um componente de tela de `src/components/`, no padrão do projeto de referência `front-end-react`. O navegador chama a API direto com `axios` (`src/services/api.js`), e o Back-End libera essa origem no CORS (`FRONTEND_URL`). React escapa os valores renderizados.

## Limites atuais

- O frontend não conecta ao banco. A tabela `sessions` do app EJS foi removida pela migration `20261028120000-remover-tabela-sessions` do Back-End.
- O JWT fica no `localStorage`, acessível ao JavaScript da página (ver `CONCERNS.md`).
- O Back-End não tem rota de logout: sair só apaga o token do navegador; o JWT continua válido até expirar.
- Rotas sem dados no Back-End (painel, lotes, sessão do iodo, recuperação de senha, análise) mostram estados vazios honestos; `/analyses/new` é a simulação do teste de iodo.
- As páginas são estáticas no build (sem `getServerSideProps`); os dados chegam depois da hidratação, com `esqueleto` enquanto carregam.

## Camadas

| Camada | Responsabilidade |
|---|---|
| `src/pages/` | Uma página por rota; só monta o componente da tela |
| `src/components/XContent/` | Tela: busca de dados, estado, formulários e marcação |
| `src/components/AppShell` | Sidebar, top bar, guarda de sessão (`GET /user`) e `useUser()` |
| `src/components/Feedback` | Mensagens (`flash`, `#mensagens`), `EmptyState`, `Modal`, `ConfirmDialog`, `Field`, `PasswordInput`, `ServerError` |
| `src/services/` | `api.js` (axios, Bearer, 401), `auth.js` (login, cadastro, usuário, sair), `rampa.js` (validação pura) |
| `public/css/` | Tailwind v4: tokens e classes de componente |
