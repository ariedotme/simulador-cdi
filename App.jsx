/** @jsx jsx */
import { jsx } from "./jsx";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const percentFormatter = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function formatCurrency(value) {
  return currencyFormatter.format(value);
}

function formatPositiveCurrency(value) {
  const prefix = value >= 0 ? "+" : "-";
  return `${prefix}${formatCurrency(Math.abs(value))}`;
}

function formatRate(value) {
  return `${percentFormatter.format(value)}% a.a.`;
}

function parseMoneyValue(value) {
  const raw = String(value ?? "").trim();

  if (!raw) {
    return 0;
  }

  const cleaned = raw.replace(/[^\d,.-]/g, "");
  const normalized = cleaned.includes(",")
    ? cleaned.replace(/\./g, "").replace(",", ".")
    : cleaned.replace(/\./g, "");
  const parsed = Number.parseFloat(normalized);

  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
}

function formatIntegerPart(value) {
  const digits = String(value ?? "").replace(/\D/g, "");
  const normalized = digits.replace(/^0+(?=\d)/, "") || "0";
  return normalized.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function formatMoneyInputValue(value) {
  if (typeof value === "string") {
    const raw = value.trim();

    if (!raw) {
      return "";
    }

    const cleaned = raw.replace(/[^\d,]/g, "");
    const hasComma = cleaned.includes(",");

    if (hasComma) {
      const [integerPart, decimalPart = ""] = cleaned.split(",", 2);
      const formattedInteger = formatIntegerPart(integerPart);
      const formattedDecimal = decimalPart.replace(/\D/g, "").slice(0, 2);
      return `${formattedInteger},${formattedDecimal}`;
    }

    return formatIntegerPart(cleaned);
  }

  if (!Number.isFinite(value)) {
    return "";
  }

  const amount = Math.max(0, value);

  if (Number.isInteger(amount)) {
    return formatIntegerPart(String(amount));
  }

  const [integerPart, decimalPart = ""] = amount.toFixed(2).split(".");
  return `${formatIntegerPart(integerPart)},${decimalPart}`;
}

function serializeForScript(value) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

function renderTaxaOption(opcao, selecionada) {
  if (opcao.nome === selecionada) {
    return (
      <option
        value={opcao.nome}
        selected="selected"
        data-option-taxa-nome={opcao.nome}
        data-option-taxa-valor={formatRate(opcao.valor)}
        data-option-taxa-raw={String(opcao.valor)}
      >
        {opcao.nome}
      </option>
    );
  }

  return (
    <option
      value={opcao.nome}
      data-option-taxa-nome={opcao.nome}
      data-option-taxa-valor={formatRate(opcao.valor)}
      data-option-taxa-raw={String(opcao.valor)}
    >
      {opcao.nome}
    </option>
  );
}

export function renderTaxaInfo({ opcoes, selecionada, sourceLabel, sourceUrl }) {
  const sourceContent = sourceUrl ? (
    <a href={sourceUrl} target="_blank" rel="noreferrer">
      {sourceLabel}
    </a>
  ) : (
    sourceLabel
  );

  return (
    <div class="taxa-toolbar">
      <label class="taxa-picker">
        <span class="taxa-label">Escolha o índice</span>
        <select name="indice" required>
          {opcoes.map((opcao) => renderTaxaOption(opcao, selecionada.nome))}
        </select>
      </label>
      <div class="taxa-card">
        <span class="taxa-overline">Taxa usada agora</span>
        <div class="taxa-main">
          <span class="taxa-chip" data-preview-taxa-nome>
            {selecionada.nome}
          </span>
          <strong data-preview-taxa-valor>{formatRate(selecionada.valor)}</strong>
        </div>
        <span class="taxa-source">Fonte: {sourceContent}</span>
      </div>
    </div>
  );
}

function renderResultadoInicial(resultado, formValues) {
  if (!resultado || resultado.length === 0) {
    return (
      <div class="result-card result-placeholder">
        <p class="result-placeholder-copy">
          Comece adicionando o primeiro m&ecirc;s manualmente ou use Simular para
          criar a proje&ccedil;&atilde;o completa.
        </p>
        <button type="button" class="secondary-button" data-add-row>
          + Adicionar m&ecirc;s
        </button>
      </div>
    );
  }

  const saldoFinal = resultado[resultado.length - 1]?.saldoFinal ?? 0;
  const saldoInicialInput =
    formatMoneyInputValue(formValues.valorInicial) ||
    formatMoneyInputValue(resultado[0]?.saldo ?? 0);

  return (
    <div class="result-card">
      <div class="result-topbar">
        <div class="result-heading">
          <h2>Proje&ccedil;&atilde;o mensal</h2>
          <span class="result-count">{resultado.length} meses configurados</span>
        </div>
        <div class="result-actions">
          <div class="final-balance-card">
            <span>Saldo final projetado</span>
            <strong>{formatCurrency(saldoFinal)}</strong>
          </div>
          <button type="button" class="secondary-button" data-add-row>
            + Adicionar m&ecirc;s
          </button>
        </div>
      </div>

      <div class="table-shell">
        <table>
          <thead>
            <tr>
              <th>M&ecirc;s</th>
              <th>Saldo do come&ccedil;o do m&ecirc;s</th>
              <th class="is-positive">Rendimento</th>
              <th>Aporte</th>
            </tr>
          </thead>
          <tbody>
            {resultado.map((linha, indice) => (
              <tr key={indice}>
                <td data-label="Mês">{linha.mes}</td>
                <td data-label="Saldo do começo do mês">
                  {indice === 0 ? (
                    <input
                      class="table-input"
                      type="text"
                      inputmode="decimal"
                      value={saldoInicialInput}
                      data-row-input="saldo-inicial"
                    />
                  ) : (
                    formatCurrency(linha.saldo)
                  )}
                </td>
                <td class="is-positive" data-label="Rendimento">
                  {formatPositiveCurrency(linha.rendimento)}
                </td>
                <td data-label="Aporte">
                  <input
                    class="table-input"
                    type="text"
                    inputmode="decimal"
                    value={formatMoneyInputValue(linha.aporte)}
                    data-row-input="aporte"
                    data-row-index={String(indice)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function App({ resultado, formValues, taxaInfo }) {
  const initialTableState = {
    initialSaldoInput: formatMoneyInputValue(formValues.valorInicial),
    rows: resultado.map((linha) => ({
      aporteInput: formatMoneyInputValue(linha.aporte),
    })),
  };

  return (
    <html lang="pt-BR">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Simulador de CDI, Selic e IPCA</title>
        <style>{`
          :root {
            --bg: #eff7f1;
            --panel: rgba(255, 255, 255, 0.92);
            --panel-strong: #ffffff;
            --text: #173126;
            --muted: #5b7466;
            --line: #d7e7dc;
            --accent: #245f4c;
            --accent-strong: #173e31;
            --accent-soft: #dff2e5;
            --positive: #14803d;
            --positive-soft: #e3f7ea;
            --shadow: 0 22px 55px rgba(28, 56, 41, 0.10);
          }

          * { box-sizing: border-box; }

          body {
            margin: 0;
            min-height: 100vh;
            padding: 1.5rem 1rem 3rem;
            display: flex;
            justify-content: center;
            background:
              radial-gradient(circle at top, rgba(111, 176, 142, 0.18), transparent 35%),
              linear-gradient(180deg, #f5fbf7 0%, #eff7f1 100%);
            color: var(--text);
            font-family: "Avenir Next", "Segoe UI", sans-serif;
          }

          a { color: var(--accent); }

          .page {
            width: min(100%, 1040px);
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 1.5rem;
          }

          .page-form {
            width: 100%;
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
            align-items: stretch;
          }

          .hero,
          .form-card,
          .result-area {
            width: 100%;
          }

          .hero {
            background: var(--panel);
            border: 1px solid rgba(255, 255, 255, 0.7);
            border-radius: 24px;
            box-shadow: var(--shadow);
            padding: 1.75rem;
            text-align: center;
            backdrop-filter: blur(10px);
          }

          .hero h1 {
            margin: 0;
            font-size: clamp(2rem, 6vw, 3rem);
            line-height: 1.05;
            color: var(--accent-strong);
          }

          .hero p {
            margin: 0.75rem auto 0;
            max-width: 40rem;
            color: var(--muted);
            font-size: 1rem;
          }

          .hero-meta {
            margin-top: 1.25rem;
            width: 100%;
          }

          .taxa-toolbar {
            width: 100%;
            display: grid;
            grid-template-columns: minmax(240px, 320px) minmax(0, 1fr);
            gap: 1rem;
            align-items: stretch;
          }

          .taxa-picker,
          .taxa-card {
            display: flex;
            flex-direction: column;
            gap: 0.55rem;
            padding: 0.95rem 1.1rem;
            border-radius: 18px;
          }

          .taxa-picker {
            justify-content: center;
            text-align: left;
            background: rgba(255, 255, 255, 0.86);
            border: 1px solid rgba(36, 95, 76, 0.10);
            box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.5);
          }

          .taxa-card {
            align-items: center;
            background: var(--accent-soft);
            border: 1px solid rgba(36, 95, 76, 0.12);
          }

          .taxa-overline,
          .taxa-label,
          .taxa-source {
            color: var(--muted);
            font-size: 0.95rem;
          }

          .taxa-picker .taxa-label {
            color: var(--accent-strong);
          }

          .taxa-main {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.7rem;
            flex-wrap: wrap;
          }

          .taxa-card strong {
            font-size: 1.4rem;
            color: var(--accent-strong);
          }

          .taxa-chip {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-width: 4.5rem;
            padding: 0.38rem 0.8rem;
            border-radius: 999px;
            background: rgba(36, 95, 76, 0.12);
            color: var(--accent-strong);
            font-size: 0.9rem;
            font-weight: 800;
            letter-spacing: 0.04em;
            text-transform: uppercase;
          }

          .form-card {
            background: var(--panel);
            border-radius: 24px;
            box-shadow: var(--shadow);
            padding: 1.5rem;
            backdrop-filter: blur(10px);
          }

          form {
            display: flex;
            flex-direction: column;
            gap: 1.25rem;
          }

          .field-grid {
            width: 100%;
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 1rem;
          }

          label {
            display: flex;
            flex-direction: column;
            gap: 0.45rem;
            text-align: left;
            font-weight: 600;
            color: var(--accent-strong);
          }

          input,
          select {
            width: 100%;
            padding: 0.9rem 1rem;
            border: 1px solid var(--line);
            border-radius: 14px;
            background: var(--panel-strong);
            color: var(--text);
            font-size: 1rem;
            transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s;
          }

          select {
            appearance: none;
            padding-right: 3rem;
            background-image:
              linear-gradient(45deg, transparent 50%, var(--accent) 50%),
              linear-gradient(135deg, var(--accent) 50%, transparent 50%),
              linear-gradient(to right, rgba(36, 95, 76, 0.12), rgba(36, 95, 76, 0.12));
            background-position:
              calc(100% - 1.2rem) calc(50% - 0.15rem),
              calc(100% - 0.8rem) calc(50% - 0.15rem),
              calc(100% - 2.7rem) 50%;
            background-size: 0.45rem 0.45rem, 0.45rem 0.45rem, 1px 55%;
            background-repeat: no-repeat;
            cursor: pointer;
          }

          input:focus,
          select:focus {
            outline: none;
            border-color: rgba(36, 95, 76, 0.55);
            box-shadow: 0 0 0 4px rgba(83, 158, 116, 0.16);
            transform: translateY(-1px);
          }

          .actions {
            margin-top: 0.25rem;
            width: 100%;
            display: flex;
            justify-content: center;
          }

          button {
            min-width: min(100%, 240px);
            border: none;
            border-radius: 999px;
            padding: 0.95rem 1.4rem;
            background: linear-gradient(135deg, #245f4c, #173e31);
            color: #fff;
            font-size: 1rem;
            font-weight: 700;
            cursor: pointer;
            transition: transform 0.2s, box-shadow 0.2s, opacity 0.2s;
            box-shadow: 0 14px 28px rgba(36, 95, 76, 0.20);
          }

          button:hover { transform: translateY(-1px); }

          .secondary-button {
            min-width: auto;
            background: #fff;
            color: var(--accent-strong);
            border: 1px solid rgba(36, 95, 76, 0.14);
            box-shadow: none;
          }

          .secondary-button:hover {
            box-shadow: 0 10px 24px rgba(36, 95, 76, 0.08);
          }

          .result-area {
            display: flex;
            justify-content: center;
          }

          .result-card {
            width: 100%;
            background: var(--panel);
            border-radius: 24px;
            box-shadow: var(--shadow);
            padding: 1.25rem;
            overflow: hidden;
          }

          .result-placeholder {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 1rem;
            min-height: 15rem;
            text-align: center;
          }

          .result-placeholder-copy {
            max-width: 32rem;
            margin: 0;
            color: var(--muted);
            line-height: 1.6;
          }

          .result-topbar {
            display: flex;
            flex-wrap: wrap;
            justify-content: space-between;
            gap: 1rem;
            align-items: center;
            margin-bottom: 1rem;
          }

          .result-heading {
            display: flex;
            flex-direction: column;
            gap: 0.35rem;
          }

          .result-heading h2 {
            margin: 0;
            font-size: 1.2rem;
            color: var(--accent-strong);
          }

          .result-count {
            color: var(--muted);
            font-size: 0.95rem;
          }

          .result-actions {
            display: flex;
            align-items: stretch;
            justify-content: flex-end;
            gap: 0.85rem;
            flex-wrap: wrap;
          }

          .final-balance-card {
            display: flex;
            flex-direction: column;
            justify-content: center;
            gap: 0.35rem;
            min-width: min(100%, 270px);
            padding: 0.95rem 1.05rem;
            border-radius: 18px;
            background: linear-gradient(135deg, #173e31, #245f4c);
            color: #fff;
            box-shadow: 0 14px 28px rgba(23, 62, 49, 0.16);
          }

          .final-balance-card span {
            font-size: 0.88rem;
            color: rgba(255, 255, 255, 0.74);
            text-transform: uppercase;
            letter-spacing: 0.04em;
          }

          .final-balance-card strong {
            font-size: clamp(1.4rem, 3vw, 1.85rem);
            line-height: 1.05;
          }

          .table-shell {
            width: 100%;
            overflow-x: auto;
            border-radius: 18px;
            border: 1px solid var(--line);
          }

          table {
            width: 100%;
            min-width: 760px;
            border-collapse: collapse;
            background: var(--panel-strong);
            table-layout: fixed;
          }

          th,
          td {
            padding: 0.9rem 1rem;
            border-bottom: 1px solid var(--line);
            text-align: center;
            font-size: 0.98rem;
          }

          th {
            background: #f4fbf6;
            color: var(--accent-strong);
            white-space: normal;
            line-height: 1.25;
          }

          td {
            white-space: nowrap;
          }

          tbody tr:last-child td { border-bottom: none; }

          .is-positive {
            color: var(--positive);
            font-weight: 700;
          }

          .table-input {
            width: min(100%, 11rem);
            margin: 0 auto;
            padding: 0.7rem 0.8rem;
            text-align: center;
            border-radius: 12px;
            border: 1px solid rgba(36, 95, 76, 0.14);
            background: #fbfefb;
            font: inherit;
            color: var(--text);
          }

          @media (max-width: 920px) {
            .taxa-toolbar { grid-template-columns: 1fr; }
            .field-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
            .result-topbar { align-items: stretch; }
            .result-actions { justify-content: stretch; width: 100%; }
            .final-balance-card { width: 100%; }
          }

          @media (max-width: 720px) {
            body { padding: 1rem 0.85rem 2rem; }
            .hero,
            .form-card,
            .result-card { border-radius: 20px; padding: 1.15rem; }
            .field-grid { grid-template-columns: 1fr; }
            .result-topbar,
            .result-actions {
              flex-direction: column;
              align-items: stretch;
            }
            .table-shell {
              overflow-x: visible;
              border: none;
              border-radius: 0;
            }
            table {
              min-width: 0;
              display: block;
              background: transparent;
            }
            thead {
              display: none;
            }
            tbody {
              display: grid;
              gap: 0.85rem;
            }
            tr {
              display: grid;
              gap: 0.75rem;
              padding: 0.95rem;
              border: 1px solid var(--line);
              border-radius: 18px;
              background: var(--panel-strong);
            }
            td {
              display: flex;
              align-items: center;
              justify-content: space-between;
              gap: 1rem;
              padding: 0;
              border-bottom: none;
              text-align: right;
              white-space: normal;
            }
            td::before {
              content: attr(data-label);
              flex: 1 1 auto;
              text-align: left;
              color: var(--muted);
              font-size: 0.88rem;
              font-weight: 700;
            }
            td[data-label="Mês"] {
              justify-content: center;
              padding-bottom: 0.25rem;
              border-bottom: 1px solid var(--line);
            }
            td[data-label="Mês"]::before {
              content: "";
              display: none;
            }
            td[data-label="Mês"] {
              color: var(--accent-strong);
              font-weight: 800;
              font-size: 1rem;
            }
            .table-input {
              width: min(100%, 10.5rem);
              margin: 0;
            }
          }
        `}</style>
      </head>
      <body>
        <main class="page">
          <form method="GET" action="/" id="simulador-form" class="page-form">
            <section class="hero">
              <h1>Simulador de CDI, Selic e IPCA</h1>
              <p>
                Compare a proje&ccedil;&atilde;o do investimento com aportes
                mensais, ajuste o saldo inicial e personalize os aportes de cada
                m&ecirc;s.
              </p>
              <div class="hero-meta">{renderTaxaInfo(taxaInfo)}</div>
            </section>

            <section class="form-card">
              <div class="field-grid">
                <label>
                  Valor Inicial (R$)
                  <input
                    name="valor_inicial"
                    type="text"
                    inputmode="decimal"
                    data-money-input="valor-inicial"
                    required
                    value={formatMoneyInputValue(formValues.valorInicial)}
                  />
                </label>
                <label>
                  Aporte Mensal (R$)
                  <input
                    name="aporte_mensal"
                    type="text"
                    inputmode="decimal"
                    data-money-input="aporte-mensal"
                    required
                    value={formatMoneyInputValue(formValues.aporteMensal)}
                  />
                </label>
                <label>
                  Meses
                  <input
                    name="meses"
                    type="number"
                    min="1"
                    required
                    value={formValues.meses}
                  />
                </label>
              </div>

              <div class="actions">
                <button type="submit">Simular</button>
              </div>
            </section>
          </form>

          <section class="result-area" id="resultado">
            {renderResultadoInicial(resultado, formValues)}
          </section>
        </main>
        <script>{`
          const form = document.getElementById("simulador-form");
          const resultSlot = document.getElementById("resultado");
          const valorInicialInput = form ? form.querySelector('input[name="valor_inicial"]') : null;
          const aporteMensalInput = form ? form.querySelector('input[name="aporte_mensal"]') : null;
          const mesesInput = form ? form.querySelector('input[name="meses"]') : null;
          const indiceSelect = form ? form.querySelector('select[name="indice"]') : null;
          const initialTableState = ${serializeForScript(initialTableState)};

          function cloneInitialRows(rows) {
            return Array.isArray(rows)
              ? rows.map((row) => ({ aporteInput: typeof row.aporteInput === "string" ? row.aporteInput : "" }))
              : [];
          }

          const state = {
            initialSaldoInput:
              typeof initialTableState.initialSaldoInput === "string"
                ? initialTableState.initialSaldoInput
                : "",
            rows: cloneInitialRows(initialTableState.rows),
          };

          function escapeHtml(value) {
            return String(value)
              .replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;")
              .replace(/"/g, "&quot;");
          }

          function parseMoney(value) {
            const raw = String(value ?? "").trim();

            if (!raw) {
              return 0;
            }

            const cleaned = raw.replace(/[^\\d,.-]/g, "");
            const normalized = cleaned.includes(",")
              ? cleaned.replace(/\\./g, "").replace(",", ".")
              : cleaned.replace(/\\./g, "");
            const parsed = Number.parseFloat(normalized);

            return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
          }

          function formatMoneyInput(value) {
            const raw = String(value ?? "").trim();

            if (!raw) {
              return "";
            }

            const cleaned = raw.replace(/[^\\d,]/g, "");
            const hasComma = cleaned.includes(",");
            const formatIntegerPart = (digits) => {
              const normalized = digits.replace(/^0+(?=\\d)/, "") || "0";
              return normalized.replace(/\\B(?=(\\d{3})+(?!\\d))/g, ".");
            };

            if (hasComma) {
              const parts = cleaned.split(",");
              const integerPart = formatIntegerPart(parts[0].replace(/\\D/g, ""));
              const decimalPart = (parts[1] || "").replace(/\\D/g, "").slice(0, 2);
              return integerPart + "," + decimalPart;
            }

            return formatIntegerPart(cleaned.replace(/\\D/g, ""));
          }

          function normalizeMoneyInputElement(input) {
            const formatted = formatMoneyInput(input.value);
            input.value = formatted;
            return formatted;
          }

          function formatCurrency(value) {
            return new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(value);
          }

          function formatPositiveCurrency(value) {
            const prefix = value >= 0 ? "+" : "-";
            return prefix + formatCurrency(Math.abs(value));
          }

          function formatRate(value) {
            return (
              new Intl.NumberFormat("pt-BR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }).format(value) + "% a.a."
            );
          }

          function getSelectedTaxaAnual() {
            if (!indiceSelect) {
              return 0;
            }

            const selectedOption = indiceSelect.options[indiceSelect.selectedIndex];
            const rawValue = selectedOption
              ? selectedOption.getAttribute("data-option-taxa-raw")
              : "0";
            const parsed = Number.parseFloat(rawValue || "0");

            return Number.isFinite(parsed) ? parsed : 0;
          }

          function syncTaxaPreview() {
            if (!form || !indiceSelect) {
              return;
            }

            const nomeTarget = form.querySelector("[data-preview-taxa-nome]");
            const valorTarget = form.querySelector("[data-preview-taxa-valor]");
            const selectedOption = indiceSelect.options[indiceSelect.selectedIndex];

            if (!nomeTarget || !valorTarget || !selectedOption) {
              return;
            }

            nomeTarget.textContent =
              selectedOption.getAttribute("data-option-taxa-nome") || selectedOption.value;
            valorTarget.textContent =
              selectedOption.getAttribute("data-option-taxa-valor") ||
              formatRate(getSelectedTaxaAnual());
          }

          function calculateRows() {
            const taxaMensal = Math.pow(1 + getSelectedTaxaAnual() / 100, 1 / 12) - 1;
            let saldoAtual = parseMoney(state.initialSaldoInput);

            return state.rows.map((row, index) => {
              const aporte = parseMoney(row.aporteInput);
              const saldo = saldoAtual;
              const rendimento = saldo * taxaMensal;
              const saldoFinal = saldo + rendimento + aporte;

              saldoAtual = saldoFinal;

              return {
                mes: index + 1,
                saldo,
                rendimento,
                aporte,
                aporteInput: row.aporteInput,
                saldoFinal,
              };
            });
          }

          function createPlaceholderMarkup() {
            return (
              '<div class="result-card result-placeholder">' +
              '<p class="result-placeholder-copy">Comece adicionando o primeiro m&ecirc;s manualmente ou use Simular para criar a proje&ccedil;&atilde;o completa.</p>' +
              '<button type="button" class="secondary-button" data-add-row>+ Adicionar m&ecirc;s</button>' +
              "</div>"
            );
          }

          function createResultMarkup(rows) {
            if (!rows.length) {
              return createPlaceholderMarkup();
            }

            const saldoFinal = rows[rows.length - 1].saldoFinal;
            const body = rows
              .map((row, index) => {
                const saldoCell =
                  index === 0
                    ? '<input class="table-input" type="text" inputmode="decimal" value="' +
                      escapeHtml(state.initialSaldoInput) +
                      '" data-row-input="saldo-inicial" />'
                    : formatCurrency(row.saldo);

                return (
                  "<tr>" +
                  '<td data-label="Mês">' + row.mes + "</td>" +
                  '<td data-label="Saldo do começo do mês">' + saldoCell + "</td>" +
                  '<td class="is-positive" data-label="Rendimento">' + formatPositiveCurrency(row.rendimento) + "</td>" +
                  '<td data-label="Aporte">' +
                  '<input class="table-input" type="text" inputmode="decimal" value="' +
                  escapeHtml(row.aporteInput) +
                  '" data-row-input="aporte" data-row-index="' +
                  index +
                  '" />' +
                  "</td>" +
                  "</tr>"
                );
              })
              .join("");

            return (
              '<div class="result-card">' +
              '<div class="result-topbar">' +
              '<div class="result-heading">' +
              '<h2>Proje&ccedil;&atilde;o mensal</h2>' +
              '<span class="result-count">' + rows.length + " meses configurados</span>" +
              "</div>" +
              '<div class="result-actions">' +
              '<div class="final-balance-card">' +
              "<span>Saldo final projetado</span>" +
              "<strong>" + formatCurrency(saldoFinal) + "</strong>" +
              "</div>" +
              '<button type="button" class="secondary-button" data-add-row>+ Adicionar m&ecirc;s</button>' +
              "</div>" +
              "</div>" +
              '<div class="table-shell">' +
              "<table>" +
              "<thead>" +
              "<tr>" +
              "<th>M&ecirc;s</th>" +
              "<th>Saldo do come&ccedil;o do m&ecirc;s</th>" +
              '<th class="is-positive">Rendimento</th>' +
              "<th>Aporte</th>" +
              "</tr>" +
              "</thead>" +
              "<tbody>" +
              body +
              "</tbody>" +
              "</table>" +
              "</div>" +
              "</div>"
            );
          }

          function captureFocus(target) {
            if (!(target instanceof HTMLInputElement)) {
              return null;
            }

            return {
              selector:
                target.dataset.rowInput === "aporte"
                  ? '[data-row-input="aporte"][data-row-index="' +
                    target.dataset.rowIndex +
                    '"]'
                  : '[data-row-input="saldo-inicial"]',
              selectionStart:
                typeof target.selectionStart === "number" ? target.selectionStart : null,
              selectionEnd:
                typeof target.selectionEnd === "number" ? target.selectionEnd : null,
            };
          }

          function restoreFocus(focusState) {
            if (!focusState || !resultSlot) {
              return;
            }

            const nextInput = resultSlot.querySelector(focusState.selector);

            if (!(nextInput instanceof HTMLInputElement)) {
              return;
            }

            nextInput.focus();

            if (
              typeof focusState.selectionStart === "number" &&
              typeof focusState.selectionEnd === "number"
            ) {
              try {
                nextInput.setSelectionRange(
                  focusState.selectionStart,
                  focusState.selectionEnd,
                );
              } catch {}
            }
          }

          function renderResult(options = {}) {
            if (!resultSlot) {
              return;
            }

            resultSlot.innerHTML = createResultMarkup(calculateRows());
            restoreFocus(options.focus || null);
          }

          function addRow() {
            const defaultAporte = aporteMensalInput ? aporteMensalInput.value : "";

            if (state.rows.length === 0) {
              state.initialSaldoInput = valorInicialInput ? valorInicialInput.value : "";
            }

            state.rows.push({
              aporteInput: defaultAporte,
            });
          }

          function rebuildRowsFromForm() {
            const totalMeses = mesesInput
              ? Math.max(0, Number.parseInt(mesesInput.value || "0", 10) || 0)
              : 0;
            const defaultAporte = aporteMensalInput ? aporteMensalInput.value : "";

            state.initialSaldoInput = valorInicialInput ? valorInicialInput.value : "";
            state.rows = Array.from({ length: totalMeses }, () => ({
              aporteInput: defaultAporte,
            }));
          }

          if (form && resultSlot && valorInicialInput && aporteMensalInput && mesesInput && indiceSelect) {
            if (window.location.search) {
              window.history.replaceState(
                {},
                "",
                window.location.pathname + window.location.hash,
              );
            }

            [valorInicialInput, aporteMensalInput].forEach((input) => {
              if (input instanceof HTMLInputElement) {
                normalizeMoneyInputElement(input);
              }
            });

            syncTaxaPreview();
            renderResult();

            form.addEventListener("change", (event) => {
              const target = event.target;

              if (target === indiceSelect) {
                syncTaxaPreview();
                renderResult();
              }
            });

            form.addEventListener("input", (event) => {
              const target = event.target;

              if (!(target instanceof HTMLInputElement)) {
                return;
              }

              if (target === valorInicialInput || target === aporteMensalInput) {
                normalizeMoneyInputElement(target);
              }

              if (target === valorInicialInput) {
                state.initialSaldoInput = target.value;

                if (state.rows.length > 0) {
                  renderResult();
                }
              }
            });

            form.addEventListener("submit", (event) => {
              event.preventDefault();

              if (!form.reportValidity()) {
                return;
              }

              rebuildRowsFromForm();
              syncTaxaPreview();
              renderResult();
            });

            resultSlot.addEventListener("click", (event) => {
              const target = event.target;

              if (!(target instanceof Element)) {
                return;
              }

              const addButton = target.closest("[data-add-row]");

              if (!addButton) {
                return;
              }

              addRow();
              renderResult();
            });

            resultSlot.addEventListener("input", (event) => {
              const target = event.target;

              if (!(target instanceof HTMLInputElement)) {
                return;
              }

              const focusState = captureFocus(target);

              if (target.dataset.rowInput === "saldo-inicial") {
                state.initialSaldoInput = normalizeMoneyInputElement(target);
                valorInicialInput.value = state.initialSaldoInput;
                renderResult({ focus: focusState });
                return;
              }

              if (target.dataset.rowInput === "aporte") {
                const rowIndex = Number.parseInt(target.dataset.rowIndex || "-1", 10);

                if (!Number.isInteger(rowIndex) || !state.rows[rowIndex]) {
                  return;
                }

                state.rows[rowIndex].aporteInput = normalizeMoneyInputElement(target);
                renderResult({ focus: focusState });
              }
            });
          }
        `}</script>
      </body>
    </html>
  );
}
