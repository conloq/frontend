# Arquitetura

## Fluxo

```text
navegador --cookie HttpOnly--> frontend Express/EJS (:4000)
                                  |-- GET página: sessão JWT -> Back-End REST (:8080)
                                  |                     -> res.render(view, locals)
                                  |-- POST /login: recebe JWT -> sessão
                                  |-- POST formulário: controller -> Back-End com Bearer -> redirect 303
```

O frontend e o Back-End continuam em repositórios separados. `index.js` configura Express, EJS e `express-session`, serve arquivos estáticos e monta `controllers/pageController.js`. Esse módulo valida a sessão, busca os dados e entrega as views com locals. O EJS escapa valores com `<%= ... %>`.

`public/js/app.js` trata validações e interações do navegador. Formulários enviam POST para rotas same-origin do `pageController`, que chama a API, usa flash de sessão e redireciona após o envio. O navegador não recebe `API_URL` nem o JWT e não depende de CORS para acessar a API.

## Limites atuais

- Dados disponíveis são buscados no servidor antes do render, incluindo usuário global do shell, perfil, acessos, receitas e rampas.
- Rotas sem dados correspondentes no Back-End seguem em estados vazios honestos; o exemplo `/dw2-example` demonstra dados passados diretamente a `res.render`.
- JWT fica em sessão Express com cookie `HttpOnly`, `SameSite=Strict` e `Secure` em produção.
- A sessão usa `express-mysql-session` na tabela `sessions` do banco MySQL existente. A tabela é criada por migration do Back-End; o adaptador do frontend não a cria.
- O frontend usa credenciais separadas, limitadas à tabela de sessões. A disponibilidade do MySQL passa a ser requisito de inicialização do servidor de páginas.
- O token não é revogado no logout pela API; destruir a sessão do frontend impede que o navegador continue usando aquele token.

## Camadas

| Camada | Responsabilidade |
|---|---|
| `index.js` | Configuração do Express, sessão persistida em MySQL, estáticos e montagem do controller de páginas |
| `controllers/pageController.js` | Rotas de tela, autenticação, chamadas à API e adaptação dos POSTs de formulário |
| `views/` | HTML EJS das telas, formulários e estado inicial renderizado |
| `public/js/app.js` | Validação de formulários, interações e visuais derivados dos dados renderizados |
| `public/js/script.js` | Sidebar, modais, foco e interações do shell |
