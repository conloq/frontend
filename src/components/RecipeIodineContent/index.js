import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import AppShell from '@/components/AppShell';
import { Field, plural, ServerError } from '@/components/Feedback';
import { minutos, useReceita } from '@/components/RecipeContent';

// Prévia: capturas a partir da primeira coleta, no intervalo, até o máximo; a faixa é a duração da rampa
function Previa({ valores, rampas }) {
    const primeira = Number(valores.primeiraColeta);
    const intervalo = Number(valores.intervalo);
    const maximo = Number(valores.maximoColetas);
    const rampa = rampas.find((t) => String(t.id) === valores.rampa);
    const valido =
        primeira >= 0 && intervalo > 0 && Number.isInteger(maximo) && maximo >= 1 && maximo <= 20;

    const capturas = valido
        ? Array.from({ length: maximo }, (_, i) => primeira + i * intervalo)
        : [];
    const duracao = rampa ? minutos(rampa.timer) : 0;
    const total = Math.max(duracao || 0, capturas.at(-1) ?? 0) + intervalo;
    // 4% de folga nas pontas para o número da captura não cortar
    const pos = (m) => `${4 + (92 * m) / total}%`;
    const nomeRampa = rampa
        ? `da rampa ${rampa.orderRamp ?? rampas.indexOf(rampa) + 1}`
        : 'da rampa';
    const resumo = valido
        ? `${plural(maximo, 'captura', 'capturas')} a partir de ${primeira} min ${nomeRampa}, a cada ${intervalo} min` +
          (duracao > 0 ? `; a rampa tem ${Math.round(duracao)} min programados.` : '.')
        : 'Preencha a primeira coleta, o intervalo e o máximo para ver a prévia.';

    return (
        <section className="card flex flex-col gap-5 p-6" aria-labelledby="tituloPrevia">
            <div className="flex flex-col gap-0.5">
                <h2 id="tituloPrevia" className="text-lg font-semibold">
                    Prévia da sessão
                </h2>
                <p id="previaResumo" className="text-sm text-texto-2" aria-live="polite">
                    {resumo}
                </p>
            </div>
            <div className="relative h-16 overflow-hidden" aria-hidden="true">
                <div className="absolute inset-x-0 top-2 h-3 rounded-full border border-linha bg-fundo" />
                <div
                    id="previaRampa"
                    className="absolute left-0 top-2 h-3 rounded-l-full bg-acao/25"
                    style={{ width: valido && duracao > 0 ? pos(duracao) : 0 }}
                />
                {valido && (
                    <div id="previaCapturas" className="absolute inset-0">
                        {/* a calibração da sessão acontece antes da primeira captura */}
                        <span
                            className="absolute top-0 flex -translate-x-1/2 flex-col items-center gap-1"
                            style={{ left: pos(Math.max(0, primeira - intervalo / 2)) }}
                        >
                            <span className="grid size-7 place-items-center rounded-full border-2 border-info bg-info-suave text-sm text-info">
                                <i className="ph ph-crosshair" />
                            </span>
                            <span className="text-xs font-semibold text-info">Calibração</span>
                        </span>
                        {capturas.map((m, i) => (
                            <span
                                key={i}
                                className="absolute top-0 flex -translate-x-1/2 flex-col items-center gap-1"
                                style={{ left: pos(m) }}
                            >
                                <span className="grid size-7 place-items-center rounded-full border-2 border-acao bg-superficie text-xs font-semibold text-acao">
                                    {i + 1}
                                </span>
                                <span className="text-xs tabular-nums text-texto-2">{m} min</span>
                            </span>
                        ))}
                    </div>
                )}
            </div>
            <p className="text-[13px] text-texto-2 max-lg:hidden">
                A sessão para na primeira captura com ausência de amido detectável ou ao chegar no
                máximo de capturas. Uma captura inconclusiva é repetida e não conta no limite.
            </p>
        </section>
    );
}

function TesteIodo() {
    const { id, recipe, rampas, erro } = useReceita();
    const [valores, setValores] = useState({
        rampa: '',
        primeiraColeta: '30',
        intervalo: '10',
        maximoColetas: '6',
    });

    // pré-seleciona a rampa que cobre 65 ºC (sacarificação)
    useEffect(() => {
        const sacarificacao = rampas?.find(
            (t) => t.minTemperatureRamp <= 65 && 65 <= t.maxTemperatureRamp
        );
        if (sacarificacao) setValores((atual) => ({ ...atual, rampa: String(sacarificacao.id) }));
    }, [rampas]);

    if (erro || (recipe && rampas === null))
        return <ServerError message={erro ?? 'Não foi possível carregar os dados da receita.'} />;
    if (!recipe) return <div className="esqueleto h-40 rounded-xl" aria-label="Carregando" />;

    const mudar = (event) => setValores({ ...valores, [event.target.name]: event.target.value });
    const numero = (name, props) => (
        <input
            id={name}
            name={name}
            type="number"
            inputMode="numeric"
            value={valores[name]}
            onChange={mudar}
            required
            {...props}
        />
    );
    const legenda = (titulo, texto) => (
        <legend className="mb-4 max-lg:mb-2">
            <span className="block font-display text-lg font-semibold">{titulo}</span>
            <span className="text-sm text-texto-2 max-lg:hidden">{texto}</span>
        </legend>
    );

    return (
        // shortcut: sem rota para salvar o teste de iodo (conloq/mash#101), o envio só é bloqueado; ligar quando existir
        <form
            id="formIodoReceita"
            className="flex flex-1 flex-col gap-6"
            data-sem-api="conloq/mash#101"
            noValidate
            onSubmit={(event) => event.preventDefault()}
        >
            <div className="flex flex-col gap-1 max-lg:contents">
                <Link href={`/recipes/${id}`} className="btn-voltar self-start max-lg:hidden">
                    <i className="ph ph-arrow-left" aria-hidden="true" />
                    <span>{recipe.name}</span>
                </Link>
                <h1 className="text-[30px] font-semibold max-lg:sr-only">Teste de iodo</h1>
            </div>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_400px] xl:items-start">
                <div className="card flex flex-col gap-5 p-6 max-lg:border-0 max-lg:bg-transparent max-lg:p-0">
                    <fieldset className="flex flex-col gap-4">
                        {legenda(
                            'Quando testar',
                            'O teste só vale com o mosto na temperatura e no tempo certos da rampa.'
                        )}
                        <div className="grid gap-5 sm:grid-cols-2">
                            <Field
                                name="rampa"
                                inputId="iodoRampa"
                                label="Rampa do teste"
                                help="Normalmente a rampa de sacarificação."
                            >
                                <select
                                    id="iodoRampa"
                                    name="rampa"
                                    value={valores.rampa}
                                    onChange={mudar}
                                    required
                                >
                                    {rampas.length ? (
                                        <>
                                            <option value="">Escolha a rampa</option>
                                            {rampas.map((rampa, i) => (
                                                <option key={rampa.id} value={rampa.id}>
                                                    Rampa {rampa.orderRamp ?? i + 1} ·{' '}
                                                    {rampa.minTemperatureRamp} a{' '}
                                                    {rampa.maxTemperatureRamp} ºC
                                                </option>
                                            ))}
                                        </>
                                    ) : (
                                        <option value="">Nenhuma rampa nesta receita</option>
                                    )}
                                </select>
                                <i
                                    className="ph ph-caret-down pointer-events-none absolute right-3.5 text-lg!"
                                    aria-hidden="true"
                                />
                            </Field>
                            <Field
                                name="primeiraColeta"
                                inputId="primeiraColeta"
                                label="Primeira coleta"
                                unit="min"
                                help="Contado depois que a rampa atinge a temperatura."
                            >
                                {numero('primeiraColeta', {
                                    min: 0,
                                    max: 240,
                                    placeholder: 'Ex.: 30',
                                })}
                            </Field>
                        </div>
                    </fieldset>
                    <hr className="border-linha max-lg:hidden" />
                    <fieldset className="flex flex-col gap-4">
                        {legenda(
                            'Se ainda houver amido',
                            'A mosturação continua nesta rampa e o teste se repete até não haver amido.'
                        )}
                        <div className="grid gap-5 sm:grid-cols-2">
                            <Field
                                name="intervalo"
                                label="Intervalo entre coletas"
                                unit="min"
                                help="Tempo até a próxima coleta."
                            >
                                {numero('intervalo', { min: 1, max: 120, placeholder: 'Ex.: 10' })}
                            </Field>
                            <Field
                                name="maximoColetas"
                                label="Máximo de coletas"
                                unit="coletas"
                                help="Limite de testes por lote."
                            >
                                {numero('maximoColetas', {
                                    min: 1,
                                    max: 20,
                                    placeholder: 'Ex.: 6',
                                })}
                            </Field>
                        </div>
                    </fieldset>
                </div>

                <aside
                    className="card flex flex-col gap-3 p-6 max-lg:hidden"
                    aria-labelledby="tituloComoFunciona"
                >
                    <h2 id="tituloComoFunciona" className="text-lg font-semibold">
                        Como vai funcionar
                    </h2>
                    <ul className="flex flex-col gap-3 text-[15px] leading-relaxed">
                        <li className="flex gap-3">
                            <i
                                className="ph ph-video-camera mt-1 text-lg text-texto-2"
                                aria-hidden="true"
                            />
                            A câmera fixa da bancada captura cada coleta sozinha e compara a cor com
                            os controles calibrados na sessão.
                        </li>
                        <li className="flex gap-3">
                            <i
                                className="ph ph-check-circle mt-1 text-lg text-sucesso"
                                aria-hidden="true"
                            />
                            Sem amido detectável: a sessão para e o mosto pode seguir para o mash
                            out.
                        </li>
                        <li className="flex gap-3">
                            <i
                                className="ph ph-arrow-clockwise mt-1 text-lg text-aviso"
                                aria-hidden="true"
                            />
                            Com amido: a mosturação continua na rampa e a captura se repete no
                            intervalo.
                        </li>
                        <li className="flex gap-3">
                            <i
                                className="ph ph-warning mt-1 text-lg text-texto-2"
                                aria-hidden="true"
                            />
                            Uma captura inconclusiva é repetida e não conta no limite.
                        </li>
                    </ul>
                </aside>
            </div>

            <Previa valores={valores} rampas={rampas} />

            <div className="sticky bottom-0 -mx-4 mt-auto flex flex-wrap items-center gap-3 border-t border-linha bg-superficie px-4 py-4 sm:-mx-6 sm:px-6 lg:-mx-10 lg:-mb-8 lg:px-10">
                <div className="acoes sm:ml-auto">
                    <Link href={`/recipes/${id}`} className="btn-secundario">
                        Cancelar
                    </Link>
                    <button type="submit" className="btn-primario">
                        <span className="lg:hidden">Salvar</span>
                        <span className="max-lg:hidden">Salvar teste de iodo</span>
                    </button>
                </div>
            </div>
        </form>
    );
}

export default function RecipeIodineContent() {
    const { query } = useRouter();
    return (
        <AppShell
            title="Teste de iodo"
            trail={['Receitas', 'Teste de iodo']}
            back={query.id ? `/recipes/${query.id}` : '/recipes'}
        >
            <TesteIodo />
        </AppShell>
    );
}
