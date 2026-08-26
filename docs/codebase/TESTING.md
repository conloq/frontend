# Testing

## 1. Test runner e scripts

`package.json` define o script `test`, mas ele é um placeholder que termina com erro intencionalmente. Não existe runner de testes configurado.

## 2. Localização dos testes

- Diretórios `test/`, `tests/` ou `__tests__/`: [TODO] nenhum conjunto de testes implementado foi identificado pelo scan.
- Testes junto ao código: [TODO] não encontrados.

## 3. Assertions, mocks e fixtures

- Biblioteca de assertions: [TODO] não configurada.
- Mocks, fixtures e factories: [TODO] não encontrados.
- Estratégia de mock para MySQL, sessão, ip-api ou Multer: [TODO] não documentada nem implementada.

## 4. Verificações disponíveis

As verificações recomendadas pelo repositório são pontuais:

```bash
node --check <arquivo.js>
npm run build:css
```

Templates EJS podem ser compilados com o pacote `ejs` instalado. O build CSS usa `public/css/tailwind.css` como fonte e `public/css/style.css` como saída.

## 5. Integração e ambiente de teste

- Testes end-to-end: [TODO] não configurados.
- Testes de integração com MySQL: [TODO] não configurados; a execução completa exige MySQL local e banco configurado.
- Testes de browser: [TODO] não há suíte declarada no manifesto.
- Cobertura mínima: [TODO] não há configuração de coverage.

## 6. Verificações recentes registradas

- `node --check controller/receitaController.js`: executado sem saída de erro.
- `node --check public/js/script.js`: executado sem saída de erro.
- `git diff --check` nos arquivos correspondentes: executado sem erros de whitespace.

## 7. Lacunas e decisão de intenção

- [ASK USER] Definir quais fluxos críticos devem receber testes automatizados é uma decisão de produto/equipe ainda não registrada.
- [TODO] Não há evidência de pipeline que execute testes automaticamente.

## 8. Evidências existentes

- `package.json`
- `AGENTS.md`
- `index.js`
- `public/css/tailwind.css`
- `public/css/style.css`
- `docs/codebase/.codebase-scan.txt` (scan preservado)

## Evidências

- `package.json`
- `AGENTS.md`
- `index.js`
- `public/css/tailwind.css`
- `public/css/style.css`
