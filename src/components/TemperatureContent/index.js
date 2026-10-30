import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ConfirmDialog, Field, flash, ServerError } from '@/components/Feedback';
import { useReceita } from '@/components/RecipeContent';
import { api, mensagemErro } from '@/services/api';
import { getAxiosConfig } from '@/services/auth';
import { comSegundos, HORARIOS, TEMPERATURAS, validarRampa } from '@/services/rampa';

const CAMPOS = [...TEMPERATURAS, ...HORARIOS, 'orderRamp'];

export default function TemperatureContent() {
    const router = useRouter();
    const { id, recipe, rampas, erro } = useReceita();
    const idRampa = router.query.temperatureId;
    const editando = Boolean(idRampa);
    const rampa = rampas?.find((t) => String(t.id) === idRampa);
    const [valores, setValores] = useState(Object.fromEntries(CAMPOS.map((key) => [key, ''])));
    const [erros, setErros] = useState({});
    const [confirmacao, setConfirmacao] = useState(null);

    useEffect(() => {
        if (rampa)
            setValores(Object.fromEntries(CAMPOS.map((key) => [key, String(rampa[key] ?? '')])));
    }, [rampa]);

    if (erro) return <ServerError message={erro} />;
    if (editando && rampas && !rampa)
        return <ServerError message="Não foi possível carregar esta rampa." />;
    if (!recipe || (editando && !rampa))
        return <div className="skeleton h-40 rounded-xl" aria-label="Carregando" />;

    const salvar = async (event) => {
        event.preventDefault();
        const novos = validarRampa(valores);
        setErros(novos);
        if (Object.keys(novos).length) {
            flash('danger', 'Confira os campos marcados. Corrija e salve de novo.');
            return event.target.querySelector(`[name="${Object.keys(novos)[0]}"]`)?.focus();
        }
        const corpo = {
            ...Object.fromEntries(TEMPERATURAS.map((key) => [key, Number(valores[key])])),
            ...Object.fromEntries(HORARIOS.map((key) => [key, comSegundos(valores[key])])),
            ...(valores.orderRamp !== '' && { orderRamp: Number(valores.orderRamp) }),
        };
        try {
            const { data } = editando
                ? await api.put(`/temperatures/${idRampa}`, corpo, getAxiosConfig())
                : await api.post(`/recipes/${id}/temperatures`, corpo, getAxiosConfig());
            flash('success', data?.message ?? 'Temperatura criada com sucesso.');
            router.push(`/recipes/${id}`);
        } catch (error) {
            flash('danger', mensagemErro(error, 'Não foi possível salvar os dados.'));
        }
    };

    const excluir = async () => {
        try {
            await api.delete(`/temperatures/${idRampa}`, getAxiosConfig());
            flash('success', 'Rampa excluída.');
            router.push(`/recipes/${id}`);
        } catch (error) {
            flash('danger', mensagemErro(error, 'Não foi possível excluir a rampa.'));
        }
    };

    const input = (name, props) => (
        <input
            id={name}
            name={name}
            value={valores[name]}
            onChange={(event) => setValores({ ...valores, [name]: event.target.value })}
            aria-invalid={erros[name] ? 'true' : undefined}
            {...props}
        />
    );
    const temperatura = (name, rotulo, curto) => (
        <Field
            name={name}
            label={
                <>
                    <span className="lg:hidden">{curto}</span>
                    <span className="max-lg:hidden">{rotulo}</span>
                </>
            }
            unit="ºC"
            error={erros[name]}
        >
            {input(name, {
                type: 'number',
                inputMode: 'numeric',
                min: 0,
                max: 100,
                step: 1,
                placeholder: 'Ex.: 65',
                required: true,
            })}
        </Field>
    );
    const horario = (name, rotulo, ajuda) => (
        <Field name={name} label={rotulo} help={ajuda} error={erros[name]}>
            {input(name, { type: 'time', step: 1, required: true })}
        </Field>
    );
    const legenda = (titulo, texto) => (
        <legend className="mb-4 max-lg:sr-only">
            <span className="block font-display text-lg font-semibold">{titulo}</span>
            <span className="text-sm text-muted-foreground">{texto}</span>
        </legend>
    );
    const titulo = editando
        ? rampa.orderRamp
            ? `Editar rampa ${rampa.orderRamp}`
            : 'Editar rampa'
        : 'Nova rampa';

    return (
        <form
            id="temperatureForm"
            className="flex flex-1 flex-col gap-6"
            noValidate
            onSubmit={salvar}
        >
            <div className="flex flex-col gap-1 max-lg:contents">
                <Link
                    id="backToRecipe"
                    href={`/recipes/${id}`}
                    className="btn-back self-start max-lg:hidden"
                >
                    <i className="ph ph-arrow-left" aria-hidden="true" />
                    <span>{recipe.name}</span>
                </Link>
                <h1 id="rampTitle" className="text-[30px] font-semibold max-lg:sr-only">
                    {titulo}
                </h1>
            </div>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_400px]">
                <div className="card flex flex-col gap-5 p-6 max-lg:border-0 max-lg:bg-transparent max-lg:p-0">
                    <fieldset className="flex flex-col gap-4">
                        {legenda(
                            'Faixa da rampa',
                            'Temperatura que o mosto precisa manter nesta rampa.'
                        )}
                        <div className="grid grid-cols-2 gap-3 lg:gap-5">
                            {temperatura('minTemperatureRamp', 'Temperatura mínima', 'Mínima')}
                            {temperatura('maxTemperatureRamp', 'Temperatura máxima', 'Máxima')}
                        </div>
                    </fieldset>
                    <hr className="border-border max-lg:hidden" />
                    <fieldset className="flex flex-col gap-4">
                        {legenda('Tempo', 'Horários no formato hh:min:s.')}
                        <div className="grid gap-5 md:grid-cols-3">
                            {horario('timer', 'Temporizador', 'Quanto a rampa dura.')}
                            {horario(
                                'initialization',
                                'Início do timer',
                                'Desde o começo da mosturação.'
                            )}
                            {horario('idealTime', 'Tempo ideal', 'Tempo esperado nesta rampa.')}
                        </div>
                    </fieldset>
                    <hr className="border-border max-lg:hidden" />
                    <fieldset className="flex flex-col gap-4">
                        {legenda(
                            'Limites aceitáveis',
                            'Faixa tolerada antes de corrigir o aquecimento.'
                        )}
                        <div className="grid grid-cols-2 gap-3 lg:gap-5">
                            {temperatura('minTemperatureLimit', 'Limite mínimo', 'Limite mín.')}
                            {temperatura('maxTemperatureLimit', 'Limite máximo', 'Limite máx.')}
                        </div>
                    </fieldset>
                    <Field
                        name="orderRamp"
                        label="Ordem da rampa (opcional)"
                        help="Posição desta rampa na receita."
                        error={erros.orderRamp}
                        className="sm:max-w-80"
                    >
                        {input('orderRamp', {
                            type: 'number',
                            inputMode: 'numeric',
                            step: 1,
                            placeholder: 'Ex.: 1',
                        })}
                    </Field>
                </div>

                <aside
                    className="card flex flex-col gap-3.5 self-start p-6 max-lg:hidden"
                    aria-labelledby="howToFillTitle"
                >
                    <h2 id="howToFillTitle" className="text-lg font-semibold">
                        Como preencher
                    </h2>
                    <ul className="flex list-disc flex-col gap-2 pl-5 text-sm leading-relaxed marker:text-muted-foreground">
                        <li>Temperaturas em números inteiros, de 0 a 100&nbsp;ºC.</li>
                        <li>A mínima nunca passa da máxima, na faixa e nos limites.</li>
                        <li>Horários com hora, minuto e segundo, como 00:40:00.</li>
                        <li>Só a ordem é opcional.</li>
                    </ul>
                </aside>
            </div>

            <div className="sticky bottom-0 -mx-4 mt-auto flex flex-wrap items-center gap-3 border-t border-border bg-surface px-4 py-4 sm:-mx-6 sm:px-6 lg:-mx-10 lg:-mb-8 lg:px-10">
                {editando && (
                    <button
                        type="button"
                        id="btnDelete"
                        className="btn-danger max-sm:w-full"
                        onClick={() =>
                            setConfirmacao({
                                titulo: 'Excluir esta rampa?',
                                mensagem: 'Não dá para desfazer.',
                                botao: 'Excluir rampa',
                                aoConfirmar: excluir,
                            })
                        }
                    >
                        <i className="ph ph-trash" aria-hidden="true" />
                        Excluir rampa
                    </button>
                )}
                <div className="actions sm:ml-auto">
                    <Link id="cancelRamp" href={`/recipes/${id}`} className="btn-secondary">
                        Cancelar
                    </Link>
                    <button type="submit" className="btn-primary">
                        {editando ? 'Salvar alterações' : 'Salvar rampa'}
                    </button>
                </div>
            </div>
            <ConfirmDialog pedido={confirmacao} onClose={() => setConfirmacao(null)} />
        </form>
    );
}
