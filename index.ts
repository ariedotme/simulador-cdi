import { App } from "./App.jsx";
import { simularCDI, type LinhaResultado } from "./simulador";

const TAXA_NAMES = ["CDI", "Selic", "IPCA"] as const;
type TaxaNome = (typeof TAXA_NAMES)[number];

type FormValues = {
  valorInicial: string;
  aporteMensal: string;
  meses: string;
  indice: TaxaNome;
};

type TaxaOption = {
  nome: TaxaNome;
  valor: number;
};

type TaxaCatalog = {
  opcoes: TaxaOption[];
  sourceLabel: string;
  sourceUrl: string;
};

type TaxaInfo = TaxaCatalog & {
  selecionada: TaxaOption;
};

type SimulacaoPayload = {
  taxaInfo: TaxaInfo;
  formValues: FormValues;
  resultado: LinhaResultado[];
};

const DEFAULT_TAXA: TaxaNome = "CDI";
const DEFAULT_TAXAS: TaxaOption[] = [
  { nome: "CDI", valor: 14.4 },
  { nome: "Selic", valor: 14.5 },
  { nome: "IPCA", valor: 4.39 },
];
const BRASIL_API_TAXAS_URL = "https://brasilapi.com.br/api/taxas/v1";

function isTaxaNome(value: string): value is TaxaNome {
  return TAXA_NAMES.includes(value as TaxaNome);
}

function emptyFormValues(): FormValues {
  return {
    valorInicial: "",
    aporteMensal: "",
    meses: "",
    indice: DEFAULT_TAXA,
  };
}

function isValidSimulationInput(
  valorInicial: number,
  aporteMensal: number,
  meses: number,
) {
  return (
    Number.isFinite(valorInicial) &&
    valorInicial >= 0 &&
    Number.isFinite(aporteMensal) &&
    aporteMensal >= 0 &&
    Number.isInteger(meses) &&
    meses > 0
  );
}

async function getTaxaCatalog(): Promise<TaxaCatalog> {
  const fallbackMap = new Map(DEFAULT_TAXAS.map((taxa) => [taxa.nome, taxa.valor]));

  try {
    const response = await fetch(BRASIL_API_TAXAS_URL);
    const taxas = (await response.json()) as Array<{ nome?: string; valor?: number }>;
    let hasApiValue = false;

    for (const taxa of taxas) {
      if (typeof taxa.nome === "string" && isTaxaNome(taxa.nome) && typeof taxa.valor === "number") {
        fallbackMap.set(taxa.nome, taxa.valor);
        hasApiValue = true;
      }
    }

    if (hasApiValue) {
      return {
        opcoes: TAXA_NAMES.map((nome) => ({
          nome,
          valor: fallbackMap.get(nome) ?? 0,
        })),
        sourceLabel: "BrasilAPI / Taxas",
        sourceUrl: BRASIL_API_TAXAS_URL,
      };
    }
  } catch {}

  return {
    opcoes: DEFAULT_TAXAS,
    sourceLabel: "Valores padrão da aplicação",
    sourceUrl: "",
  };
}

async function buildSimulationPayloadFromValues(
  formValues: FormValues,
): Promise<SimulacaoPayload> {
  const valorInicial = Number.parseFloat(formValues.valorInicial);
  const aporteMensal = Number.parseFloat(formValues.aporteMensal);
  const meses = Number.parseInt(formValues.meses, 10);
  const taxaCatalog = await getTaxaCatalog();
  const selecionada =
    taxaCatalog.opcoes.find((opcao) => opcao.nome === formValues.indice) ?? taxaCatalog.opcoes[0]!;

  const resultado = isValidSimulationInput(valorInicial, aporteMensal, meses)
    ? simularCDI({
        valorInicial,
        meses,
        aporteMensal,
        taxaCdi: selecionada.valor,
      })
    : [];

  return {
    taxaInfo: {
      ...taxaCatalog,
      selecionada,
    },
    formValues,
    resultado,
  };
}

Bun.serve({
  port: 3000,
  async fetch(req) {
    const formValues = emptyFormValues();
    const payload = await buildSimulationPayloadFromValues(formValues);
    const html = App(payload);
    return new Response(html, { headers: { "Content-Type": "text/html" } });
  },
});

console.log("Simulador CDI rodando: http://localhost:3000");
