export const TEMPERATURAS = [
    'minTemperatureRamp',
    'maxTemperatureRamp',
    'minTemperatureLimit',
    'maxTemperatureLimit',
];
export const HORARIOS = ['timer', 'initialization', 'idealTime'];
const HORARIO_VALIDO = /^([01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/;
// input time sem segundos devolve HH:MM
export const comSegundos = (valor) => (/^\d{2}:\d{2}$/.test(valor ?? '') ? `${valor}:00` : valor);

// Valida como a API: inteiro de 0 a 100, mínima ≤ máxima, HH:MM:SS
export function validarRampa(campos) {
    const erros = {};
    TEMPERATURAS.forEach((key) => {
        const n = Number(campos[key]);
        if (campos[key] === '' || !Number.isInteger(n) || n < 0 || n > 100)
            erros[key] = 'Use um número inteiro de 0 a 100 ºC.';
    });
    const ok = (...keys) => keys.every((key) => !erros[key]);
    if (
        ok('minTemperatureRamp', 'maxTemperatureRamp') &&
        Number(campos.minTemperatureRamp) > Number(campos.maxTemperatureRamp)
    )
        erros.maxTemperatureRamp = `Precisa ser igual ou maior que a mínima (${campos.minTemperatureRamp} ºC).`;
    if (
        ok('minTemperatureLimit', 'maxTemperatureLimit') &&
        Number(campos.minTemperatureLimit) > Number(campos.maxTemperatureLimit)
    )
        erros.maxTemperatureLimit = `Precisa ser igual ou maior que o limite mínimo (${campos.minTemperatureLimit} ºC).`;
    HORARIOS.forEach((key) => {
        if (!HORARIO_VALIDO.test(comSegundos(campos[key]) ?? ''))
            erros[key] = 'Use hora, minuto e segundo: 00:40:00.';
    });
    if (campos.orderRamp !== '' && !Number.isInteger(Number(campos.orderRamp)))
        erros.orderRamp = 'Ordem da rampa deve ser um inteiro válido';
    return erros;
}
