# scripts/

Verificações locais executadas por `npm test`, com módulos nativos assert/VM e EJS já instalado. Não chamam a API real.

- `verify-profile-contract.mjs`: valida valores do usuário escapados em HTML EJS e formulário POST recebido pelo controller.
- `verify-upload.mjs`: valida form multipart e encaminhamento do upload pelo controller com sessão.
- `verify-client.mjs`: configuração da API após a importação, sessão MySQL, foco, formulários, placeholders dos campos compatíveis e renderização EJS com escape contra injeção de atributos.

Os testes são checks locais de contrato; verifique também os fluxos no navegador com API real quando mudar autenticação ou interface.
