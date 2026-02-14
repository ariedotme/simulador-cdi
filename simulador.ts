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
}) {
  const CDI_ANUAL = taxaCdi / 100;
  const CDI_MENSAL = Math.pow(1 + CDI_ANUAL, 1 / 12) - 1;
  let saldoAtual = valorInicial;
  const resultado = [];
  for (let mes = 1; mes <= meses; mes++) {
    const rendimento = saldoAtual * CDI_MENSAL;
    saldoAtual += rendimento + aporteMensal;
    resultado.push({
      mes,
      saldo: saldoAtual,
      rendimento,
      aporte: aporteMensal,
    });
  }
  return resultado;
}
