# Simulador CDI

Um simulador interativo de investimentos em CDI com interface web.

## Funcionalidades

- Simula rendimento de investimentos em CDI com aportes mensais
- Taxa CDI atualizada automaticamente via API (Brasil API)
- Cálculo preciso com juros compostos mensais

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
4. A tabela exibe o saldo, rendimento e aportes mês a mês

## Arquivos de Dados

O arquivo `simulacao_financeira.csv` é gerado a cada nova simulação.
