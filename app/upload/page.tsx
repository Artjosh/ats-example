"use client";

import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import { useApp } from "../context/AppContext";
import { MOCK_FILES, MOCK_CANDIDATES, MOCK_STATS } from "../lib/mockData";
import FileCard from "../components/FileCard";
import { FileItem, CandidateResult, Recommendation } from "../lib/types";

// ── Puter.js client-side analysis ──────────────────────────────
const SYSTEM_PROMPT = `Você é um analista de RH especializado em triagem de currículos. Avalie APENAS competências técnicas e experiência. Ignore nome, gênero, idade. Pontue de 0 a 100. Responda SOMENTE em JSON válido.`;

function buildBatchPrompt(requirements: string, candidates: { name: string; text: string }[]): string {
    let prompt = `REQUISITOS DA VAGA:\n${requirements}\n\nVocê receberá ${candidates.length} currículos para analisar. Analise CADA um.\n\n`;
    for (let i = 0; i < candidates.length; i++) {
        prompt += `--- CURRÍCULO ${i + 1} (arquivo: ${candidates[i].name}) ---\n${candidates[i].text.substring(0, 6000)}\n\n`;
    }
    prompt += `Retorne SOMENTE um JSON array com ${candidates.length} objetos (um por currículo, na mesma ordem):
[{ "name": "nome completo", "score": 0-100, "summary": "resumo 2-3 linhas", "strengths": ["..."], "gaps": ["..."], "recommendation": "AVANÇAR|ANALISAR|DESCARTAR" }]
Critérios: AVANÇAR (>=80), ANALISAR (>=50), DESCARTAR (<50). Apenas o JSON array, sem texto extra.`;
    return prompt;
}

function parseResults(raw: string, candidates: { name: string }[]): CandidateResult[] {
    try {
        let jsonStr = raw.trim();
        const codeBlockMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (codeBlockMatch) jsonStr = codeBlockMatch[1].trim();
        const parsed = JSON.parse(jsonStr);
        const items = Array.isArray(parsed) ? parsed : (parsed.candidates || parsed.results || [parsed]);
        return items.map((p: Record<string, unknown>, i: number) => ({
            id: `result-${i}-${Date.now()}`,
            fileName: candidates[i]?.name || `candidate-${i}`,
            name: (p.name as string) || candidates[i]?.name?.replace(/\.[^.]+$/, "") || `Candidato ${i + 1}`,
            score: Math.min(100, Math.max(0, Number(p.score) || 0)),
            summary: (p.summary as string) || "Análise não disponível",
            strengths: Array.isArray(p.strengths) ? p.strengths as string[] : [],
            gaps: Array.isArray(p.gaps) ? p.gaps as string[] : [],
            recommendation: (["AVANÇAR", "ANALISAR", "DESCARTAR"].includes(p.recommendation as string)
                ? p.recommendation
                : (Number(p.score) || 0) >= 80 ? "AVANÇAR" : (Number(p.score) || 0) >= 50 ? "ANALISAR" : "DESCARTAR") as Recommendation,
        }));
    } catch {
        return candidates.map((c, i) => ({
            id: `result-${i}-${Date.now()}`,
            fileName: c.name,
            name: c.name.replace(/\.[^.]+$/, ""),
            score: 0,
            summary: "Erro ao processar resposta da IA",
            strengths: [],
            gaps: ["Erro na análise"],
            recommendation: "DESCARTAR" as Recommendation,
        }));
    }
}

async function analyzeWithPuter(requirements: string, candidates: { name: string; text: string }[]): Promise<{ results: CandidateResult[]; stats: { total: number; qualified: number; analyze: number; discard: number; timeSeconds: number; averageScore: number } }> {
    const startTime = Date.now();
    const prompt = buildBatchPrompt(requirements, candidates);

    const response = await window.puter.ai.chat(
        [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: prompt },
        ],
        { model: "gemini-2.0-flash" }
    );

    const rawText = response?.message?.content || response?.text || response?.toString() || "";
    const results = parseResults(rawText, candidates);

    results.sort((a, b) => b.score - a.score);

    const elapsed = (Date.now() - startTime) / 1000;
    const stats = {
        total: results.length,
        qualified: results.filter(r => r.recommendation === "AVANÇAR").length,
        analyze: results.filter(r => r.recommendation === "ANALISAR").length,
        discard: results.filter(r => r.recommendation === "DESCARTAR").length,
        timeSeconds: Math.round(elapsed),
        averageScore: Math.round(results.reduce((s, r) => s + r.score, 0) / results.length),
    };

    return { results, stats };
}

// ── Component ──────────────────────────────────────────────────
export default function ResumeUploadPage() {
    const router = useRouter();
    const {
        mockMode, files, jobConfig,
        addFiles, removeFile, clearFiles,
        setResults, setIsAnalyzing, setAnalysisProgress,
        isAnalyzing, analysisProgress,
    } = useApp();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [dragOver, setDragOver] = useState(false);
    const [error, setError] = useState("");

    const handleFileSelect = useCallback((selectedFiles: FileList | null) => {
        if (!selectedFiles) return;
        const newFiles: FileItem[] = Array.from(selectedFiles)
            .filter(f => f.name.endsWith(".pdf") || f.name.endsWith(".docx") || f.name.endsWith(".doc"))
            .map(f => ({
                id: `file-${Date.now()}-${Math.random().toString(36).slice(2)}`,
                name: f.name,
                size: f.size,
                file: f,
                status: "pending" as const,
            }));
        if (newFiles.length === 0) {
            setError("Selecione arquivos PDF ou DOCX.");
            return;
        }
        setError("");
        addFiles(newFiles);
    }, [addFiles]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        handleFileSelect(e.dataTransfer.files);
    }, [handleFileSelect]);

    const handleAnalyze = async () => {
        if (mockMode) {
            setResults(MOCK_CANDIDATES, MOCK_STATS);
            router.push("/dashboard");
            return;
        }

        if (files.length === 0) {
            setError("Adicione pelo menos um currículo.");
            return;
        }

        setError("");
        setIsAnalyzing(true);
        setAnalysisProgress({ current: 0, total: files.length });

        try {
            // Step 1: Extract text from files (always server-side)
            const formData = new FormData();
            files.forEach(f => formData.append("files", f.file));

            setAnalysisProgress({ current: 0, total: files.length });
            const extractRes = await fetch("/api/extract", { method: "POST", body: formData });
            if (!extractRes.ok) {
                const err = await extractRes.json();
                throw new Error(err.error || "Extraction failed");
            }
            const extractData = await extractRes.json();

            const extracted = extractData.files.filter((f: { text: string; error?: string }) => f.text && !f.error);
            if (extracted.length === 0) {
                throw new Error("Nenhum currículo conseguiu ser processado. Verifique se os arquivos são PDFs/DOCX válidos.");
            }

            setAnalysisProgress({ current: Math.ceil(files.length * 0.4), total: files.length });

            // Step 2: Analyze — choose between Puter (client-side) or API (server-side)
            let analyzeData;

            if (jobConfig.provider === "puter") {
                // ── Puter.js: runs directly in the browser, no API key needed ──
                analyzeData = await analyzeWithPuter(
                    jobConfig.requirements,
                    extracted.map((f: { name: string; text: string }) => ({ name: f.name, text: f.text }))
                );
            } else {
                // ── Traditional API providers: send to our backend ──
                const analyzeRes = await fetch("/api/analyze", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        requirements: jobConfig.requirements,
                        provider: jobConfig.provider,
                        apiKey: jobConfig.apiKey,
                        candidates: extracted.map((f: { name: string; text: string }) => ({ name: f.name, text: f.text })),
                    }),
                });

                if (!analyzeRes.ok) {
                    const err = await analyzeRes.json();
                    throw new Error(err.error || "Analysis failed");
                }

                analyzeData = await analyzeRes.json();
            }

            setAnalysisProgress({ current: files.length, total: files.length });
            setResults(analyzeData.results, analyzeData.stats);

            // Small delay to show 100% progress
            await new Promise(r => setTimeout(r, 500));
            router.push("/dashboard");
        } catch (e) {
            setError(e instanceof Error ? e.message : "Erro desconhecido");
        } finally {
            setIsAnalyzing(false);
            setAnalysisProgress(null);
        }
    };

    const displayFiles = mockMode ? MOCK_FILES : files;
    const progressPercent = analysisProgress
        ? Math.round((analysisProgress.current / analysisProgress.total) * 100)
        : 0;

    return (
        <div className="max-w-5xl mx-auto px-6 pt-24 pb-12 min-h-screen">
            {/* Progress Steps */}
            <div className="flex justify-between items-center mb-12 relative px-4">
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-surface-container-high -translate-y-1/2 -z-10"></div>
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-secondary text-on-secondary flex items-center justify-center shadow-[0_0_15px_rgba(86,249,249,0.3)]">
                        <span className="material-symbols-outlined font-bold">check</span>
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant">Vaga</span>
                </div>
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-[0_0_20px_rgba(172,163,255,0.4)]">
                        <span className="text-sm font-bold">02</span>
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-widest text-primary">Upload</span>
                </div>
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center border border-outline-variant/10">
                        <span className="text-sm font-bold">03</span>
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant">Resultados</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left: Upload Zone */}
                <div className="lg:col-span-7 space-y-6">
                    <div
                        id="tutorial-upload-zone"
                        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={handleDrop}
                        onClick={() => !mockMode && fileInputRef.current?.click()}
                        className={`bg-surface-container-low rounded-md p-8 border-2 border-dashed h-[400px] flex flex-col items-center justify-center group transition-all duration-300 cursor-pointer ${
                            dragOver
                                ? "border-primary bg-primary/5 scale-[1.02]"
                                : "border-outline-variant/20 hover:border-primary/50"
                        }`}
                    >
                        <div className="w-20 h-20 rounded-full bg-surface-container-high flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                            <span className="material-symbols-outlined text-primary text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>cloud_upload</span>
                        </div>
                        <h2 className="text-xl font-semibold text-on-surface mb-2">
                            {mockMode ? "Modo Demo — Arquivos simulados" : "Arraste currículos aqui ou clique para selecionar"}
                        </h2>
                        <p className="text-on-surface-variant text-sm">Aceita PDF e DOCX • Até 50 arquivos</p>
                        <input
                            ref={fileInputRef}
                            className="hidden"
                            type="file"
                            multiple
                            accept=".pdf,.docx,.doc"
                            onChange={(e) => handleFileSelect(e.target.files)}
                        />
                        {!mockMode && (
                            <button
                                onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                                className="mt-8 px-6 py-2 rounded-md bg-surface-container-highest border border-outline-variant/20 text-sm font-medium hover:bg-surface-bright transition-colors"
                            >
                                Selecionar Arquivos
                            </button>
                        )}
                    </div>

                    {/* Processing State */}
                    {(isAnalyzing || mockMode) && (
                        <div className="bg-surface-container-high rounded-md p-6 border border-primary/20 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
                            <div className="flex justify-between items-end mb-4">
                                <div>
                                    <span className="text-xs font-bold text-primary uppercase tracking-tighter">
                                        {jobConfig.provider === "puter" ? "Puter.js • Gemini 2.0 Flash" : "Analisando Inteligência Artificial"}
                                    </span>
                                    <h3 className="text-lg font-semibold text-on-surface">
                                        {isAnalyzing
                                            ? `Analisando currículo ${analysisProgress?.current || 0} de ${analysisProgress?.total || 0}...`
                                            : "Analisando currículo 3 de 12..."
                                        }
                                    </h3>
                                </div>
                                <span className="text-sm text-on-surface-variant font-medium">
                                    {isAnalyzing ? `${progressPercent}%` : "Est. 45s restantes"}
                                </span>
                            </div>
                            <div className="w-full h-2 bg-surface-container-lowest rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-primary rounded-full shadow-[0_0_10px_rgba(172,163,255,0.5)] transition-all duration-500"
                                    style={{ width: isAnalyzing ? `${progressPercent}%` : "25%" }}
                                ></div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right: File List */}
                <div className="lg:col-span-5 space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant">
                            Arquivos Selecionados ({displayFiles.length})
                        </h3>
                        {!mockMode && files.length > 0 && (
                            <button onClick={clearFiles} className="text-xs text-error-dim hover:underline">Remover todos</button>
                        )}
                        {mockMode && (
                            <button className="text-xs text-error-dim hover:underline">Remover todos</button>
                        )}
                    </div>
                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                        {displayFiles.map((f) => (
                            <FileCard
                                key={f.id}
                                name={f.name}
                                size={f.size}
                                status={f.status}
                                onRemove={() => !mockMode && removeFile(f.id)}
                            />
                        ))}
                        {!mockMode && files.length === 0 && (
                            <div className="text-center py-12 text-on-surface-variant/50 text-sm">
                                <span className="material-symbols-outlined text-3xl mb-2 block">folder_open</span>
                                Nenhum arquivo selecionado
                            </div>
                        )}
                    </div>

                    {error && (
                        <div className="bg-error/10 border border-error/20 rounded-md px-4 py-3 text-error text-sm flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">error</span>
                            {error}
                        </div>
                    )}

                    <div id="tutorial-analyze-btn" className="pt-6">
                        <button
                            onClick={handleAnalyze}
                            disabled={isAnalyzing}
                            className={`w-full h-14 bg-gradient-secondary rounded-md text-on-primary font-bold text-lg flex items-center justify-center gap-3 transition-all duration-200 shadow-[0_10px_40px_rgba(86,249,249,0.2)] ${
                                isAnalyzing ? "opacity-70 cursor-not-allowed" : "hover:scale-[1.02] active:scale-[0.98]"
                            }`}
                        >
                            {isAnalyzing ? (
                                <>
                                    <span className="animate-spin material-symbols-outlined">progress_activity</span>
                                    Processando...
                                </>
                            ) : (
                                "Analisar Currículos com IA 🚀"
                            )}
                        </button>
                        <p className="text-[11px] text-center text-on-surface-variant mt-4 px-8 leading-relaxed">
                            {jobConfig.provider === "puter"
                                ? "Análise gratuita via Puter.js — sem limites de uso, sem chaves de API."
                                : "Ao prosseguir, nossa IA processará os dados para realizar o matching com a vaga selecionada."
                            }
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
