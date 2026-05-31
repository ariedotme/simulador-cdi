# Simulador de CDI, Selic e IPCA

Um simulador interativo de investimentos com interface web.

## Funcionalidades

- Simula rendimentos com CDI, Selic ou IPCA
- Permite editar o saldo inicial e os aportes de cada mês ao vivo
- Atualiza as taxas automaticamente via BrasilAPI
- Cálculo com juros compostos mensais

## Instalação

```bash
bun install
```

## Como Usar

```bash
bun run index.ts
```

### Utilizando a Aplicação

1. Abra `http://localhost:3000`
2. Preencha os campos:
   - **Valor Inicial**: Capital inicial do investimento em reais
   - **Aporte Mensal**: Quanto você investe por mês em reais
   - **Meses**: Por quantos meses deseja simular
3. Clique em "Simular"
4. A tabela exibe o saldo do começo do mês, rendimento, aporte e o saldo final projetado
