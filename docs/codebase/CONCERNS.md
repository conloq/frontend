# Riscos e limites conhecidos

## Riscos operacionais

| Severidade | Risco | Mitigação / próximo passo |
|---|---|---|
| Alta antes de produção | O JWT fica no `localStorage`; um script injetado na página consegue lê-lo (XSS). | React escapa os dados e não há `dangerouslySetInnerHTML` com dado da API; adicionar CSP antes do deploy público. A troca para cookie `HttpOnly` exigiria rota de sessão no Back-End. |
| Alta | O Back-End precisa liberar a origem do frontend no CORS (`FRONTEND_URL`). Sem isso o navegador bloqueia todas as chamadas. | Configurar `FRONTEND_URL` com a URL publicada do frontend no Render. |
| Média | Sair só apaga o token do navegador; o Back-End não revoga o JWT. | Token copiado antes continua válido até expirar; considerar revogação no Back-End se o modelo de ameaça exigir. |
| Média | `NEXT_PUBLIC_API_URL` entra no build. | Mudar a URL da API exige novo build e deploy do frontend. |
| Média | A lista de receitas consulta as rampas uma vez por receita (N+1 no navegador). | Adequado ao volume atual; otimizar quando a API devolver as rampas junto. |
| Baixa | Next 16 avisa que o suporte a React 18 acaba no Next 17. | Atualizar para React 19 antes de subir o Next de versão maior. |
| Baixa | `public/css/style.css` é gerado e versionado. | Regerar quando classes ou diretivas Tailwind mudarem. |

## Segurança

- Valores da API são renderizados por React, que escapa o conteúdo. O único `dangerouslySetInnerHTML` é o script estático da sidebar em `src/pages/_document.js`.
- Senhas nunca vão para `flash` nem para o `localStorage`.
- Não há CSP nem conjunto completo de cabeçalhos de segurança configurados; revisar antes do deploy público.

## Verificação

`npm test` valida o contrato da camada de API e a validação de rampa. Ainda é necessária verificação em navegador com os dois servidores, em desktop e mobile, incluindo login, upload e o redirecionamento no `401`.
