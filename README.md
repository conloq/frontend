# Sistema MASH

Preview frontend EJS do Sistema MASH, com telas de receitas, temperaturas, testes de iodo e perfil de usuário.

## Execução

```bash
npm install
npm run build:css
npm start
```

O preview fica disponível em `http://localhost:8080`.

## Escopo do preview

- Express serve `public/` e renderiza os templates EJS.
- Os dados de usuário, logins, receitas, temperaturas e iodo são mocks em memória.
- POSTs respondem com redirects simples para permitir testar a navegação dos formulários.
- Não há MySQL, Sequelize, autenticação real, sessões, bcrypt, Multer, uploads persistentes ou qualquer outra persistência.
- Os ícones Phosphor são servidos em `/vendor/phosphor` a partir do pacote instalado.
