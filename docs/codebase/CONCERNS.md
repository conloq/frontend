# Riscos e limites conhecidos

## Riscos operacionais

| Severidade | Risco | Mitigação / próximo passo |
|---|---|---|
| Alta antes de produção | O JWT da sessão fica serializado na tabela `sessions` do MySQL. | Restringir credenciais à tabela, proteger segredos e conexão DB, manter tráfego MySQL privado/TLS quando aplicável. |
| Média | O servidor de páginas depende do MySQL para recuperar sessões e agora falha ao iniciar se a tabela não estiver acessível. | Aplicar a migration do Back-End antes do frontend e manter a disponibilidade do MySQL monitorada. |
| Alta antes de produção | `SESSION_SECRET` de desenvolvimento é fixo. | Em produção o servidor exige `SESSION_SECRET`; configurar segredo longo e aleatório no ambiente. |
| Média | Logout destrói a sessão do frontend, mas o Back-End não revoga o JWT emitido. | O token copiado anteriormente continua válido até expirar; considerar revogação no backend se o modelo de ameaça exigir. |
| Média | Lista de receitas consulta rampas uma vez por receita (N+1 server-side). | Adequado ao volume atual; otimizar quando a API disponibilizar inclusão em lote. |
| Média | Upload passa o stream multipart pela rota intermediária. | Validar com API real em execução antes de publicar mudanças desse caminho. |
| Baixa | `public/css/style.css` é gerado e versionado. | Regerar quando classes ou diretivas Tailwind mudarem. |

## Segurança

- Cookie de sessão `HttpOnly`, `SameSite=Strict` e `Secure` em produção; JWT não fica acessível ao JavaScript.
- Os POSTs do frontend usam cookie de sessão `SameSite=Strict`; cada handler chama uma rota explícita da API e não recebe URL ou método arbitrário do browser.
- EJS deve imprimir dados externos com `<%= ... %>`; `<%- ... %>` fica restrito a includes e markup confiável.
- Não há CSP nem conjunto completo de cabeçalhos de segurança configurados; revisar antes do deploy público.
## Verificação

`npm test` valida contratos estáticos/EJS e interações simuladas. Ainda é necessária verificação em navegador com os dois servidores, em desktop e mobile, incluindo autenticação, sessão e upload.
