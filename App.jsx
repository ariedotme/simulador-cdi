/** @jsx jsx */
import { jsx, Fragment } from "./jsx";

export function App({ resultado }) {
  return (
    <html lang="pt-BR">
      <head>
        <meta charSet="utf-8" />
        <title>Simulador CDI</title>
        <style>{`
          body { font-family: 'Segoe UI', Arial, sans-serif; margin: 2rem; background: #f7f7fa; color: #222; }
          h1 { color: #2a4d7c; }
          form { display: flex; gap: 1.5rem; flex-wrap: wrap; margin-bottom: 2rem; background: #fff; padding: 1rem 2rem; border-radius: 8px; box-shadow: 0 2px 8px #0001; }
          label { display: flex; flex-direction: column; font-weight: 500; margin-bottom: 0.5rem; }
          input { margin-top: 0.3rem; padding: 0.4rem 0.6rem; border: 1px solid #bbb; border-radius: 4px; font-size: 1rem; }
          button { background: #2a4d7c; color: #fff; border: none; border-radius: 4px; padding: 0.6rem 1.2rem; font-size: 1rem; cursor: pointer; margin-top: 1rem; transition: background 0.2s; }
          button:hover { background: #18325a; }
          table { border-collapse: collapse; margin-top: 1rem; background: #fff; box-shadow: 0 2px 8px #0001; border-radius: 8px; overflow: hidden; }
          th, td { border: 1px solid #e0e0e0; padding: 0.7rem 1.2rem; text-align: right; font-size: 1rem; }
          th { background: #eaf1fb; color: #2a4d7c; text-align: center; }
          td:first-child, th:first-child { text-align: center; }
        `}</style>
      </head>
      <body>
        <h1>Simulador CDI</h1>
        <form method="POST">
          <label>
            Valor Inicial (R$):
            <input
              name="valor_inicial"
              type="number"
              step="0.01"
              min="0"
              required
            />
          </label>
          <label>
            Aporte Mensal (R$):
            <input
              name="aporte_mensal"
              type="number"
              step="0.01"
              min="0"
              required
            />
          </label>
          <label>
            Meses:
            <input name="meses" type="number" min="1" required />
          </label>
          <button type="submit">Simular</button>
        </form>
        {resultado && resultado.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>Mês</th>
                <th>Saldo</th>
                <th>Rendimento</th>
                <th>Aporte</th>
              </tr>
            </thead>
            <tbody>
              {resultado.map((linha, i) => (
                <tr key={i}>
                  <td>{linha.mes}</td>
                  <td>R$ {linha.saldo.toFixed(2)}</td>
                  <td>R$ {linha.rendimento.toFixed(2)}</td>
                  <td>R$ {linha.aporte.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </body>
    </html>
  );
}
