import { NextRequest, NextResponse } from "next/server";

interface CandidateInput {
    name: string;
    text: string;
}

interface AnalyzeRequest {
    requirements: string;
    provider: "openai" | "anthropic" | "google";
    apiKey: string;
    candidates: CandidateInput[];
}

const SYSTEM_PROMPT = `Você é um analista de RH especializado em triagem de currículos. Sua tarefa é avaliar candidatos com base nos requisitos da vaga fornecidos.

REGRAS IMPORTANTES:
- Ignore nome, gênero, idade e foto. Avalie APENAS competências técnicas e experiência.
- Pontue de 0 a 100 baseado na aderência aos requisitos.
- Seja justo e consistente entre candidatos.
- Responda SOMENTE em JSON válido, sem markdown, sem code blocks.`;

function buildBatchPrompt(requirements: string, candidates: CandidateInput[]): string {
    let prompt = `REQUISITOS DA VAGA:\n${requirements}\n\n`;
    prompt += `Você receberá ${candidates.length} currículos para analisar. Analise CADA um e retorne um JSON array.\n\n`;
    
    for (let i = 0; i < candidates.length; i++) {
        prompt += `--- CURRÍCULO ${i + 1} (arquivo: ${candidates[i].name}) ---\n`;
        prompt += candidates[i].text.substring(0, 6000);
        prompt += `\n\n`;
    }
    
    prompt += `Retorne SOMENTE um JSON array com ${candidates.length} objetos, um para cada currículo na mesma ordem.
Cada objeto deve ter esta estrutura:
{
  "name": "nome completo do candidato extraído do currículo",
  "score": <número de 0 a 100>,
  "summary": "resumo do perfil em 2-3 linhas",
  "strengths": ["pontos fortes relevantes para a vaga"],
  "gaps": ["gaps em relação aos requisitos"],
  "recommendation": "AVANÇAR ou ANALISAR ou DESCARTAR"
}

Critérios para recommendation:
- AVANÇAR: score >= 80, forte aderência
- ANALISAR: score >= 50, aderência parcial
- DESCARTAR: score < 50, baixa aderência

Retorne APENAS o JSON array, sem texto adicional.`;

    return prompt;
}

async function callGemini(apiKey: string, systemPrompt: string, userPrompt: string): Promise<string> {
    const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${apiKey}`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                system_instruction: { parts: [{ text: systemPrompt }] },
                contents: [{ parts: [{ text: userPrompt }] }],
                generationConfig: {
                    temperature: 0.3,
                    responseMimeType: "application/json",
                },
            }),
        }
    );
    if (!res.ok) {
        const err = await res.text();
        throw new Error(`Gemini API error ${res.status}: ${err}`);
    }
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

async function callOpenAI(apiKey: string, systemPrompt: string, userPrompt: string): Promise<string> {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt },
            ],
            temperature: 0.3,
            response_format: { type: "json_object" },
        }),
    });
    if (!res.ok) {
        const err = await res.text();
        throw new Error(`OpenAI API error ${res.status}: ${err}`);
    }
    const data = await res.json();
    return data.choices?.[0]?.message?.content || "";
}

async function callAnthropic(apiKey: string, systemPrompt: string, userPrompt: string): Promise<string> {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 4096,
            system: systemPrompt,
            messages: [{ role: "user", content: userPrompt }],
            temperature: 0.3,
        }),
    });
    if (!res.ok) {
        const err = await res.text();
        throw new Error(`Anthropic API error ${res.status}: ${err}`);
    }
    const data = await res.json();
    return data.content?.[0]?.text || "";
}

function parseResults(raw: string, candidates: CandidateInput[]) {
    try {
        let jsonStr = raw.trim();
        // Strip markdown code blocks if present
        const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (jsonMatch) jsonStr = jsonMatch[1].trim();

        const parsed = JSON.parse(jsonStr);
        
        // Handle both array and object with array property
        const items = Array.isArray(parsed) ? parsed : (parsed.candidates || parsed.results || [parsed]);

        return items.map((p: Record<string, unknown>, i: number) => ({
            id: `result-${i}-${Date.now()}`,
            fileName: candidates[i]?.name || `candidate-${i}`,
            name: (p.name as string) || candidates[i]?.name?.replace(/\.[^.]+$/, "") || `Candidato ${i + 1}`,
            score: Math.min(100, Math.max(0, Number(p.score) || 0)),
            summary: (p.summary as string) || "Análise não disponível",
            strengths: Array.isArray(p.strengths) ? p.strengths : [],
            gaps: Array.isArray(p.gaps) ? p.gaps : [],
            recommendation: (["AVANÇAR", "ANALISAR", "DESCARTAR"].includes(p.recommendation as string)
                ? p.recommendation
                : (Number(p.score) || 0) >= 80 ? "AVANÇAR" : (Number(p.score) || 0) >= 50 ? "ANALISAR" : "DESCARTAR") as "AVANÇAR" | "ANALISAR" | "DESCARTAR",
        }));
    } catch {
        // If batch parsing fails, return error results for all candidates
        return candidates.map((c, i) => ({
            id: `result-${i}-${Date.now()}`,
            fileName: c.name,
            name: c.name.replace(/\.[^.]+$/, ""),
            score: 0,
            summary: "Erro ao processar resposta da IA",
            strengths: [],
            gaps: ["Erro na análise"],
            recommendation: "DESCARTAR" as const,
        }));
    }
}

export async function POST(request: NextRequest) {
    try {
        const body: AnalyzeRequest = await request.json();
        const { requirements, provider, apiKey, candidates } = body;

        if (!requirements || !apiKey || !candidates?.length) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const callLLM = provider === "google" ? callGemini
            : provider === "openai" ? callOpenAI
            : callAnthropic;

        const startTime = Date.now();

        // Send ALL candidates in a single LLM call (saves API quota and is faster)
        const batchPrompt = buildBatchPrompt(requirements, candidates);
        
        let results;
        let retries = 3;
        let lastError: Error | null = null;

        while (retries > 0) {
            try {
                const raw = await callLLM(apiKey, SYSTEM_PROMPT, batchPrompt);
                results = parseResults(raw, candidates);
                lastError = null;
                break;
            } catch (e) {
                lastError = e instanceof Error ? e : new Error("Unknown");
                if (lastError.message.includes("429") && retries > 1) {
                    // Rate limited - wait and retry
                    await new Promise(r => setTimeout(r, 5000 * (4 - retries)));
                    retries--;
                } else {
                    retries = 0;
                }
            }
        }

        if (lastError || !results) {
            return NextResponse.json({
                error: `Erro na API do LLM: ${lastError?.message || "Falha desconhecida"}. Tente novamente em alguns segundos.`
            }, { status: 502 });
        }

        const elapsed = (Date.now() - startTime) / 1000;
        const qualified = results.filter((r: { recommendation: string }) => r.recommendation === "AVANÇAR").length;
        const analyze = results.filter((r: { recommendation: string }) => r.recommendation === "ANALISAR").length;
        const discard = results.filter((r: { recommendation: string }) => r.recommendation === "DESCARTAR").length;

        // Sort by score descending
        results.sort((a: { score: number }, b: { score: number }) => b.score - a.score);

        const stats = {
            total: results.length,
            qualified,
            analyze,
            discard,
            timeSeconds: Math.round(elapsed),
            averageScore: Math.round(results.reduce((s: number, r: { score: number }) => s + r.score, 0) / results.length),
        };

        return NextResponse.json({ results, stats });
    } catch (e) {
        return NextResponse.json(
            { error: `Erro do servidor: ${e instanceof Error ? e.message : "Desconhecido"}` },
            { status: 500 }
        );
    }
}
