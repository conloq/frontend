# #71: perfil em camelCase

Revalidação em 19/10/2026 sobre a main `71d58d9a2360b5851887aadae9c2456ca370c14d`.

O backend expõe atributos camelCase. O perfil ainda lia `url_image` e `fone`; o submit enviava `fone`. Esta branch troca somente o perfil para `urlImage`/`phone`, incluindo os dois templates consumidores da foto. Rótulos, IDs, rotas, classes CSS e os campos de rampa ficam preservados.

```bash
npm ci
npm test
node --check public/js/app.js
node scripts/verify-profile-contract.mjs
```

Resultados: PASS. O verificador executa o cliente em um DOM simulado, fornece uma resposta camelCase, confere foto/telefone preenchidos, executa o submit e verifica `PUT /user` com `phone` e Bearer. Também compila os templates EJS e verifica os atributos consumidores. Não é uma conferência visual em navegador nem prova de upload real no Cloudinary.

No PR pareado do Back-End, cadastro/login/perfil e persistência de `phone` por HTTP foram exercitados em MySQL vazio com migrations. A revisão, os dois merges e a revalidação das mains devem anteceder o fechamento da #71. Esta evidência não altera seu checklist.
