import { App } from "./App.jsx";
import { simularCDI } from "./simulador";

function parseTempo(input: string): number {
  const regex = /^(?:(\d+)a)?(?:(\d+)m)?$/;
  const match = input.toLowerCase().trim().match(regex);
  if (!match) return parseInt(input) || 0;
  const anos = parseInt(match[1] || "0");
  const meses = parseInt(match[2] || "0");
  return anos * 12 + meses;
}

Bun.serve({
  port: 3000,
  async fetch(req) {
    if (req.method === "POST") {
      const form = await req.formData();
      const valorInicial = parseFloat(form.get("valor_inicial") as string);
      const meses = parseInt(form.get("meses") as string);
      const aporteMensal = parseFloat(form.get("aporte_mensal") as string);
      let taxaCdi = 11.15;
      try {
        const response = await fetch("https://brasilapi.com.br/api/taxas/v1");
        const taxas = (await response.json()) as any[];
        const cdiData = taxas.find((t: any) => t.nome === "CDI");
        if (cdiData) taxaCdi = cdiData.valor;
      } catch {}
      const resultado = simularCDI({
        valorInicial,
        meses,
        aporteMensal,
        taxaCdi,
      });
      const html = App({ resultado });
      return new Response(html, { headers: { "Content-Type": "text/html" } });
    }
    const html = App({ resultado: [] });
    return new Response(html, { headers: { "Content-Type": "text/html" } });
  },
});

console.log("� Simulador CDI rodando: http://localhost:3000");
