// Config do ESLint usada pelo Super-Linter no CI. O container não instala as dependências do projeto,
// então ela usa só os plugins que vêm nele (react, react-hooks, jsx-a11y) no lugar do eslint-config-next.
import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';

export default [
    { ignores: ['.next/**', 'node_modules/**', 'public/css/style.css', 'docs/**'] },
    js.configs.recommended,
    {
        files: ['**/*.{js,jsx,mjs}'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            parserOptions: { ecmaFeatures: { jsx: true } },
            globals: { ...globals.browser, ...globals.node },
        },
        plugins: { react, 'react-hooks': reactHooks, 'jsx-a11y': jsxA11y },
        // sem node_modules no container, a versão não pode ser detectada
        settings: { react: { version: '18.3' } },
        rules: {
            ...react.configs.recommended.rules,
            // runtime JSX do Next: não precisa importar React em cada arquivo
            ...react.configs['jsx-runtime'].rules,
            // o projeto não usa PropTypes
            'react/prop-types': 'off',
            'react-hooks/rules-of-hooks': 'error',
            'react-hooks/exhaustive-deps': 'warn',
            ...jsxA11y.flatConfigs.recommended.rules,
        },
    },
];
