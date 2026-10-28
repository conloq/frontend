import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
    return (
        <Html lang="pt-BR">
            <Head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
                <link
                    rel="stylesheet"
                    href="https://fonts.googleapis.com/css2?family=Poppins:wght@500;600;700;800&family=Roboto:wght@400;500;600;700&display=swap"
                />
                {/* Tailwind gerado por npm run build:css (public/css/style.css) */}
                <link rel="stylesheet" href="/css/style.css" />
                <link rel="icon" type="image/png" href="/img/logo-mash.png" />
            </Head>
            <body className="min-h-screen bg-fundo text-texto antialiased">
                {/* aplica a sidebar recolhida antes da primeira pintura, sem piscar entre páginas */}
                <script
                    dangerouslySetInnerHTML={{
                        __html: "try{if(localStorage.getItem('mash-sidebar-collapsed')==='true')document.body.classList.add('sidebar-collapsed')}catch{}",
                    }}
                />
                <Main />
                <NextScript />
            </body>
        </Html>
    );
}
