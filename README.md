# Sistema MASH

Preview frontend EJS do Sistema MASH, com telas de receitas, temperaturas, testes de iodo e perfil de usuário.

## Execução

```bash
npm install
npm run build:css
npm start
```

A porta do frontend é a **4000**; a 8080 fica com a API. O `preview-server.js` ainda usa 8080 quando a variável `PORT` não está definida, então suba com `PORT=4000` e acesse `http://localhost:4000`.

Este preview é temporário. Ele foi feito para ver as telas antes de a API existir e sai quando o frontend passar a consumir o Back-End.

## Escopo do preview

- Express serve `public/` e renderiza os templates EJS.
- Os dados de usuário, logins, receitas, temperaturas e iodo são mocks em memória.
- POSTs respondem com redirects simples para permitir testar a navegação dos formulários.
- Não há MySQL, Sequelize, autenticação real, sessões, bcrypt, Multer, uploads persistentes ou qualquer outra persistência.
- Os ícones Phosphor são servidos em `/vendor/phosphor` a partir do pacote instalado.
