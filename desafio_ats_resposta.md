### Sistema de Triagem Inteligente de Currículos (Mini-ATS com IA)

---

## Descrição do Problema

Profissionais de RH gastam **muito tempo** em triagem manual de currículos. O processo típico é:

1. Receber dezenas (ou centenas) de PDFs e DOCs por e-mail ou plataforma
2. Abrir cada arquivo individualmente
3. Ler e tentar identificar se o candidato possui os requisitos da vaga
4. Comparar mentalmente dezenas de perfis entre si
5. Montar uma shortlist manualmente

Isso é **lento, subjetivo e propenso a erro humano**. Candidatos qualificados são descartados por fadiga do avaliador, e candidatos medianos passam por viés de recência — o último currículo lido parece melhor simplesmente porque está fresco na memória.

Sistemas ATS profissionais como **Greenhouse**, **Lever** e **Workday** resolvem isso parcialmente, mas possuem custos muito elevados — muitas vezes inviáveis para PMEs brasileiras.

---

## Solução Proposta

Um **Mini-ATS web** que automatiza a triagem inicial de currículos usando IA. O sistema:

1. **Recebe os currículos** — upload de PDF/DOC via interface web
2. **Extrai o texto de forma inteligente** — leitura nativa da camada de texto do documento, com fallback para OCR em documentos escaneados
3. **Analisa semanticamente** o conteúdo usando LLM via API
4. **Pontua e rankeia** os candidatos com base nos requisitos da vaga
5. **Apresenta um painel visual** para o RH tomar decisão rápida

O RH simplesmente cola os requisitos da vaga, faz upload dos currículos, e recebe um ranking automático com score, resumo e recomendação para cada candidato.

---

## Ferramentas Utilizadas

| Componente | Ferramenta | Motivo |
|---|---|---|
| Frontend | Next.js 16 (React) | Framework moderno, SSR, deploy instantâneo na Vercel |
| Extração de texto PDF | pdf-parse | Lê a camada de texto nativa de PDFs digitais |
| Extração de texto DOCX | mammoth | Converte DOCX para texto limpo |
| OCR (fallback) | Tesseract.js | Para PDFs escaneados (baseados em imagem) |
| Análise semântica | API OpenAI / Anthropic / Google | Compreensão de linguagem natural e scoring |
| Deploy | Vercel | Deploy contínuo, HTTPS, domínio gratuito |
| Prototipação UI | Figma + Stitch | Design do fluxo visual antes de codar |

---

## Passo a Passo

### 1. O RH acessa o painel web
- Interface limpa e simples — sem CLI, sem terminal, sem código

### 2. Configura a vaga
- Cola os requisitos da vaga em um campo de texto
- Opcionalmente destaca quais requisitos são mais importantes (peso)
- O sistema gera automaticamente as regras de análise para a LLM (invisível pro usuário)

### 3. Faz upload dos currículos
- Arrasta ou seleciona múltiplos arquivos (PDF e/ou DOCX)
- O sistema processa em batch

### 4. Pipeline automático de análise

```
Upload → Detecção de formato → Extração de texto (nativa)
  → Se falhar: OCR → Normalização → Envio para LLM
  → Recebe score + análise → Armazena resultado
```

### 5. Visualização dos resultados
- Dashboard com cards dos candidatos ordenados por score
- Cada card mostra: **Score (0-100)**, resumo, pontos fortes, gaps, e recomendação (Avançar / Analisar / Descartar)
- Filtros por score mínimo e recomendação
- O RH foca energia humana apenas nos top candidatos

---

## Resultado Esperado

| Métrica | Antes (manual) | Depois (Mini-ATS) |
|---|---|---|
| Tempo de triagem por currículo | Minutos | Segundos |
| Tempo total de dezenas currículos | Horas | Minutos |
| Consistência de avaliação | Subjetiva / varia com fadiga | Padronizada por regras |
| Custo por análise | Alta (Hora do profissional) | Fração de centavos (via API) ou Zero (Puter) |
| Redução de tempo | — | **Massiva** |

### Impacto real
- O profissional de RH **recupera tempo valioso da sua semana** para focar em entrevistas, relacionamento com candidatos e estratégia
- A triagem se torna **reproduzível e auditável** — as regras de análise documentam exatamente o critério usado
- Zero viés por fadiga, ordem de leitura ou formatação visual do currículo

---

> **Nota:** Como parte desta entrega, desenvolvi um protótipo funcional do sistema demonstrando o fluxo completo.
