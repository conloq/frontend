import { useState } from 'react';
import Link from 'next/link';
import AppShell from '@/components/AppShell';

const ABAS = [
    ['/settings', 'ph-person', 'Acessibilidade'],
    ['/settings/security', 'ph-shield-check', 'Segurança'],
];
const VOLUMES = ['Baixo', 'Médio', 'Alto'];

function Icone({ nome }) {
    return (
        <span className="grid size-10 shrink-0 place-items-center rounded-[10px] bg-fundo max-lg:hidden">
            <i className={`ph ${nome} text-xl text-texto-2`} aria-hidden="true" />
        </span>
    );
}

function Texto({ titulo, ajuda, htmlFor, id }) {
    const Rotulo = htmlFor ? 'label' : 'span';
    return (
        <span className="flex flex-1 flex-col">
            <Rotulo htmlFor={htmlFor} id={id} className="font-semibold">
                {titulo}
            </Rotulo>
            <span className="text-sm text-texto-2">{ajuda}</span>
        </span>
    );
}

function Interruptor({ icone, titulo, ajuda, name, ligado = false }) {
    return (
        <label className="flex items-center gap-4 py-4">
            <Icone nome={icone} />
            <Texto titulo={titulo} ajuda={ajuda} />
            <input
                type="checkbox"
                role="switch"
                name={name}
                className="interruptor"
                defaultChecked={ligado}
            />
        </label>
    );
}

function Cartao({ id, titulo, subtitulo, children }) {
    return (
        <section className="card px-4 py-3 lg:px-6 lg:py-5" aria-labelledby={id}>
            <div className="pb-2">
                <h2 id={id} className="text-[17px] font-semibold">
                    {titulo}
                </h2>
                {subtitulo && <p className="text-sm text-texto-2 max-lg:hidden">{subtitulo}</p>}
            </div>
            {children}
        </section>
    );
}

function Acessibilidade() {
    const [volume, setVolume] = useState(1);
    return (
        <>
            <Cartao
                id="tituloAparencia"
                titulo="Aparência e leitura"
                subtitulo="Vale só para este navegador."
            >
                <Interruptor
                    icone="ph-moon"
                    titulo="Modo escuro"
                    ajuda="Troca o fundo claro por um tema escuro."
                    name="modoEscuro"
                />
                <div
                    className="flex flex-wrap items-center gap-4 border-t border-linha py-4"
                    role="radiogroup"
                    aria-labelledby="rotuloFonte"
                >
                    <Icone nome="ph-text-aa" />
                    <Texto
                        id="rotuloFonte"
                        titulo="Tamanho da fonte"
                        ajuda="Aumenta textos, campos e botões."
                    />
                    <div className="segmentado w-full sm:w-auto">
                        {['Pequeno', 'Médio', 'Grande'].map((rotulo, i) => (
                            <label key={rotulo}>
                                <input
                                    type="radio"
                                    name="fonte"
                                    value={rotulo}
                                    className="sr-only"
                                    defaultChecked={i === 0}
                                />
                                {rotulo}
                            </label>
                        ))}
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-4 border-t border-linha py-4">
                    <Icone nome="ph-palette" />
                    <Texto
                        htmlFor="daltonico"
                        titulo="Modo daltônico"
                        ajuda="Ajusta as cores de status para daltonismo."
                    />
                    <span className="campo-caixa relative w-full sm:w-56">
                        <select id="daltonico" name="daltonico">
                            <option value="">Desativado</option>
                            <option value="protanopia">Protanopia</option>
                            <option value="deuteranopia">Deuteranopia</option>
                            <option value="tritanopia">Tritanopia</option>
                        </select>
                        <i
                            className="ph ph-caret-down pointer-events-none absolute right-3.5 text-lg!"
                            aria-hidden="true"
                        />
                    </span>
                </div>
            </Cartao>
            <Cartao id="tituloSom" titulo="Som">
                <Interruptor
                    icone="ph-speaker-high"
                    titulo="Feedback sonoro"
                    ajuda="Toca um som em alertas e confirmações."
                    name="feedbackSonoro"
                    ligado
                />
                <div className="flex flex-col gap-2 pb-4 max-lg:hidden lg:pl-14">
                    <label htmlFor="volume" className="text-sm font-semibold">
                        Volume
                    </label>
                    <input
                        id="volume"
                        name="volume"
                        type="range"
                        min="0"
                        max="2"
                        value={volume}
                        onChange={(event) => setVolume(Number(event.target.value))}
                        className="deslizante"
                        aria-valuetext={VOLUMES[volume]}
                    />
                    <span
                        className="flex justify-between text-[13px] text-texto-2"
                        aria-hidden="true"
                    >
                        {VOLUMES.map((rotulo) => (
                            <span key={rotulo}>{rotulo}</span>
                        ))}
                    </span>
                </div>
            </Cartao>
        </>
    );
}

const LIMITES = [
    [
        'temperaturaMaxima',
        'Temperatura máxima',
        'Avisa quando a mostura passar deste valor.',
        'ph-thermometer-hot',
        72,
    ],
    [
        'temperaturaMinima',
        'Temperatura mínima',
        'Avisa quando a mostura ficar abaixo deste valor.',
        'ph-thermometer-cold',
        60,
    ],
];

function Seguranca() {
    // número (mobile) e deslizante (desktop) mostram o mesmo valor
    const [testes, setTestes] = useState(3);
    const mudarTestes = (event) => setTestes(event.target.value);
    return (
        <>
            <Cartao id="tituloIodo" titulo="Teste automático do iodo">
                <Interruptor
                    icone="ph-test-tube"
                    titulo="Validação por repetição"
                    ajuda="O resultado só vale depois de alguns testes iguais seguidos."
                    name="validacaoRepeticao"
                    ligado
                />
                <div className="flex items-center gap-4 border-t border-linha py-4 lg:hidden">
                    <label htmlFor="testesSeguidosNumero" className="flex-1 font-semibold">
                        Testes seguidos
                    </label>
                    <span className="campo-caixa w-24">
                        <input
                            id="testesSeguidosNumero"
                            type="number"
                            min="0"
                            max="10"
                            value={testes}
                            onChange={mudarTestes}
                            inputMode="numeric"
                            placeholder="Ex.: 3"
                        />
                    </span>
                </div>
                <div className="flex flex-col gap-2 pb-4 max-lg:hidden lg:pl-14">
                    <label htmlFor="testesSeguidos" className="text-sm font-semibold">
                        Testes seguidos
                    </label>
                    <input
                        id="testesSeguidos"
                        name="testesSeguidos"
                        type="range"
                        min="0"
                        max="10"
                        value={testes}
                        onChange={mudarTestes}
                        className="deslizante"
                    />
                    <span
                        className="flex justify-between text-[13px] text-texto-2"
                        aria-hidden="true"
                    >
                        <span>0</span>
                        <span>5</span>
                        <span>10</span>
                    </span>
                </div>
            </Cartao>
            <Cartao id="tituloAlertasConfig" titulo="Alertas">
                <Interruptor
                    icone="ph-bell-ringing"
                    titulo="Alerta sonoro"
                    ajuda="Desligar pode fazer você perder um alerta de temperatura."
                    name="alertaSonoro"
                    ligado
                />
                {LIMITES.map(([nome, rotulo, ajuda, icone, valor]) => (
                    <div key={nome} className="flex items-center gap-4 border-t border-linha py-4">
                        <Icone nome={icone} />
                        <Texto htmlFor={nome} titulo={rotulo} ajuda={ajuda} />
                        <span className="campo-caixa w-28">
                            <input
                                id={nome}
                                name={nome}
                                type="number"
                                min="0"
                                max="100"
                                defaultValue={valor}
                                inputMode="numeric"
                                placeholder="Ex.: 65"
                            />
                            <span className="campo-unidade">°C</span>
                        </span>
                    </div>
                ))}
            </Cartao>
        </>
    );
}

// Abas Acessibilidade e Segurança. Salvar ainda não tem rota na API: o envio só é bloqueado, sem aviso (decisão de 22/10/2026).
export default function SettingsContent({ seguranca = false }) {
    const atual = seguranca ? '/settings/security' : '/settings';
    // Cancelar remonta o formulário: volta também os campos controlados (volume, testes seguidos)
    const [versao, setVersao] = useState(0);
    return (
        <AppShell
            title="Configuração"
            trail={['Configuração', seguranca ? 'Segurança' : 'Acessibilidade']}
        >
            <div className="flex flex-col gap-1.5 max-lg:contents">
                <h1 className="text-[30px] font-semibold max-lg:sr-only">Configuração</h1>
                <p className="text-texto-2 max-lg:hidden">
                    Preferências de exibição, som e alertas do sistema.
                </p>
            </div>
            {/* Desktop: abas na lateral; mobile: abas no topo */}
            <div className="grid gap-5 lg:max-w-[1244px] lg:grid-cols-[260px_minmax(0,1fr)] lg:items-start">
                <nav
                    className="flex gap-1 rounded-[10px] border border-linha bg-fundo p-1 lg:flex-col lg:rounded-xl lg:bg-superficie lg:p-2"
                    aria-label="Seções da configuração"
                >
                    {ABAS.map(([href, icone, rotulo]) => {
                        const ativa = href === atual;
                        return (
                            <Link
                                key={href}
                                href={href}
                                aria-current={ativa ? 'page' : undefined}
                                className={`flex min-h-10 items-center gap-2 rounded-lg px-4 text-sm font-medium transition-colors max-lg:flex-1 max-lg:justify-center lg:min-h-12 lg:rounded-[10px] lg:text-base ${ativa ? 'max-lg:border max-lg:border-linha max-lg:bg-superficie max-lg:font-semibold lg:bg-acao-suave lg:font-semibold lg:text-acao' : 'text-texto-2 lg:text-texto lg:hover:bg-hover-neutro'}`}
                            >
                                <i
                                    className={`${ativa ? 'ph-fill text-foco' : 'ph text-texto-2'} ${icone} text-lg max-lg:hidden`}
                                    aria-hidden="true"
                                />
                                {rotulo}
                            </Link>
                        );
                    })}
                </nav>
                <form
                    key={`${atual}-${versao}`}
                    id="formConfiguracao"
                    className="flex min-w-0 flex-col gap-5"
                    data-sem-api="próxima entrega"
                    noValidate
                    onSubmit={(event) => event.preventDefault()}
                    onReset={(event) => {
                        event.preventDefault();
                        setVersao(versao + 1);
                    }}
                >
                    {seguranca ? <Seguranca /> : <Acessibilidade />}
                    <div className="acoes barra-mobile lg:self-end">
                        <button type="reset" className="btn-secundario max-lg:hidden">
                            Cancelar
                        </button>
                        <button type="submit" className="btn-primario max-lg:col-span-2">
                            Salvar alterações
                        </button>
                    </div>
                </form>
            </div>
        </AppShell>
    );
}
