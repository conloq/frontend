import nextVitals from 'eslint-config-next/core-web-vitals';

const config = [
    ...nextVitals,
    {
        // Buscar dados no useEffect é o padrão do projeto (axios no cliente, como no front-end-react de referência).
        rules: { 'react-hooks/set-state-in-effect': 'off' },
    },
    { ignores: ['.next/**', '.delta/**', 'public/css/style.css', 'docs/**'] },
];

export default config;
