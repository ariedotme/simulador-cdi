export type LinhaResultado = {
  mes: number;
  saldo: number;
  rendimento: number;
  aporte: number;
  saldoFinal: number;
};

export function calcularTaxaMensal(taxaCdi: number) {
  return Math.pow(1 + taxaCdi / 100, 1 / 12) - 1;
}

export function simularComAportes({
  valorInicial,
  aportes,
  taxaCdi,
}: {
  valorInicial: number;
  aportes: number[];
  taxaCdi: number;
}): LinhaResultado[] {
  const taxaMensal = calcularTaxaMensal(taxaCdi);
  let saldoAtual = valorInicial;
  const resultado: LinhaResultado[] = [];

  for (const [indice, aporte] of aportes.entries()) {
    const saldo = saldoAtual;
    const rendimento = saldo * taxaMensal;
    const saldoFinal = saldo + rendimento + aporte;

    resultado.push({
      mes: indice + 1,
      saldo,
      rendimento,
      aporte,
      saldoFinal,
    });

    saldoAtual = saldoFinal;
  }

  return resultado;
}

export function simularCDI({
  valorInicial,
  meses,
  aporteMensal,
  taxaCdi,
}: {
  valorInicial: number;
  meses: number;
  aporteMensal: number;
  taxaCdi: number;
}): LinhaResultado[] {
  return simularComAportes({
    valorInicial,
    aportes: Array.from({ length: meses }, () => aporteMensal),
    taxaCdi,
  });
}
