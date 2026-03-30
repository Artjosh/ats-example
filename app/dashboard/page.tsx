"use client";

import { useState } from "react";
import Link from "next/link";
import { useApp } from "../context/AppContext";

import CandidateCard from "../components/CandidateCard";
import { MOCK_CANDIDATES, MOCK_STATS } from "../lib/mockData";
import { Recommendation } from "../lib/types";

type FilterType = "all" | Recommendation;

export default function DashboardPage() {
    const { mockMode, results, analysisStats, resetAll } = useApp();
    const [activeFilter, setActiveFilter] = useState<FilterType>("all");
    const [minScore, setMinScore] = useState(0);

    const candidates = mockMode ? MOCK_CANDIDATES : results;
    const stats = mockMode ? MOCK_STATS : analysisStats;

    // Apply filters
    const filtered = candidates
        .filter(c => activeFilter === "all" || c.recommendation === activeFilter)
        .filter(c => c.score >= minScore);

    // Count per category
    const counts = {
        all: candidates.filter(c => c.score >= minScore).length,
        advance: candidates.filter(c => c.recommendation === "AVANÇAR" && c.score >= minScore).length,
        analyze: candidates.filter(c => c.recommendation === "ANALISAR" && c.score >= minScore).length,
        discard: candidates.filter(c => c.recommendation === "DESCARTAR" && c.score >= minScore).length,
    };

    // Pipeline stats
    const avgScore = candidates.length > 0
        ? Math.round(candidates.reduce((s, c) => s + c.score, 0) / candidates.length)
        : 0;
    const qualityGrade = avgScore >= 80 ? "A+" : avgScore >= 65 ? "A" : avgScore >= 50 ? "B+" : avgScore >= 35 ? "B" : "C";

    const filterBtn = (filter: FilterType, label: string, count: number) => (
        <button
            onClick={() => setActiveFilter(filter)}
            className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${
                activeFilter === filter
                    ? "bg-[#6C5CE7] text-white"
                    : "bg-surface-container-high text-on-surface-variant hover:bg-surface-variant"
            }`}
        >
            {label} ({count})
        </button>
    );

    // Empty state for live mode with no results
    if (!mockMode && candidates.length === 0) {
        return (
            <div className="pt-20 pb-12 px-8 min-h-screen flex flex-col items-center justify-center">
                    <span className="material-symbols-outlined text-6xl text-on-surface-variant/20 mb-4">analytics</span>
                    <h2 className="text-2xl font-bold text-on-surface mb-2">Nenhuma análise realizada</h2>
                    <p className="text-on-surface-variant mb-8">Configure a vaga e faça upload dos currículos para ver os resultados aqui.</p>
                    <Link href="/">
                        <button className="px-8 py-3.5 signature-gradient text-on-primary-fixed font-bold rounded-md hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2">
                            <span className="material-symbols-outlined">add_circle</span>
                            Iniciar Análise
                        </button>
                    </Link>
            </div>
        );
    }

    return (
        <div className="pt-20 pb-12 px-8 min-h-screen">
                {/* Header Section (Stats Summary) */}
                <header className="flex flex-col md:flex-row justify-between items-end gap-6 mb-10">
                    <div>
                        <nav className="text-[11px] font-bold tracking-widest text-on-surface-variant/60 uppercase mb-2">Recruitment Pipeline &gt; Software Engineer</nav>
                        <h1 className="text-4xl font-extrabold text-on-background tracking-tight mb-4">Dashboard de Resultados</h1>
                        <div className="flex gap-4 flex-wrap">
                            <div className="bg-surface-container-low px-5 py-3 rounded-md border border-outline-variant/5 shadow-sm">
                                <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider mb-1">Total Processados</p>
                                <p className="text-xl font-bold text-on-surface">{stats?.total || 0} currículos analisados</p>
                            </div>
                            <div className="bg-surface-container-low px-5 py-3 rounded-md border border-outline-variant/5 shadow-sm">
                                <p className="text-[10px] text-secondary uppercase font-bold tracking-wider mb-1">Qualificados</p>
                                <p className="text-xl font-bold text-secondary">{stats?.qualified || 0} recomendados</p>
                            </div>
                            <div className="bg-surface-container-low px-5 py-3 rounded-md border border-outline-variant/5 shadow-sm">
                                <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider mb-1">Performance AI</p>
                                <p className="text-xl font-bold text-primary">Tempo total: {stats?.timeSeconds || 0}s</p>
                            </div>
                        </div>
                    </div>
                    <Link href="/" onClick={() => !mockMode && resetAll()}>
                        <button className="px-8 py-3.5 border-2 border-outline-variant/30 text-on-background font-bold rounded-md hover:bg-surface-variant/50 transition-all active:scale-95 flex items-center gap-2">
                            <span className="material-symbols-outlined">add_circle</span>
                            Nova Análise
                        </button>
                    </Link>
                </header>

                {/* Filters Bar */}
                <section id="tutorial-dashboard-filters" className="mb-12 flex flex-col md:flex-row gap-8 items-center bg-surface-container-low/50 p-6 rounded-md border border-outline-variant/5">
                    <div className="flex flex-wrap gap-2 flex-grow">
                        {filterBtn("all", "Todos", counts.all)}
                        {filterBtn("AVANÇAR", "Avançar", counts.advance)}
                        {filterBtn("ANALISAR", "Analisar", counts.analyze)}
                        {filterBtn("DESCARTAR", "Descartar", counts.discard)}
                    </div>
                    <div className="w-full md:w-64 flex flex-col gap-2">
                        <div className="flex justify-between text-[11px] font-bold uppercase text-on-surface-variant">
                            <span>Score Mínimo</span>
                            <span className="text-primary">{minScore}/100</span>
                        </div>
                        <input
                            className="w-full h-1.5 bg-surface-container-highest rounded-full appearance-none cursor-pointer accent-primary"
                            max={100} min={0} type="range"
                            value={minScore}
                            onChange={(e) => setMinScore(Number(e.target.value))}
                        />
                    </div>
                </section>

                {/* Results Grid */}
                <section className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    {filtered.map(candidate => (
                        <CandidateCard key={candidate.id} candidate={candidate} />
                    ))}
                    {filtered.length === 0 && (
                        <div className="col-span-2 text-center py-16 text-on-surface-variant/50">
                            <span className="material-symbols-outlined text-4xl mb-2 block">filter_list_off</span>
                            <p className="text-lg font-medium">Nenhum candidato encontrado com os filtros atuais</p>
                            <button onClick={() => { setActiveFilter("all"); setMinScore(0); }} className="mt-4 text-primary text-sm hover:underline">
                                Limpar filtros
                            </button>
                        </div>
                    )}
                </section>

                {/* Bento Grid Insights Section */}
                <section className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="col-span-1 md:col-span-2 bg-gradient-to-r from-surface-container-low to-surface-container px-8 py-10 rounded-md border border-outline-variant/5">
                        <h4 className="text-xl font-bold mb-4 flex items-center gap-3">
                            <span className="material-symbols-outlined text-primary">analytics</span>
                            Análise do Pipeline de IA
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <div>
                                <span className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest">Aderência</span>
                                <p className="text-2xl font-extrabold text-on-surface">{avgScore}%</p>
                            </div>
                            <div>
                                <span className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest">Qualidade</span>
                                <p className="text-2xl font-extrabold text-secondary">{qualityGrade}</p>
                            </div>
                            <div>
                                <span className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest">Velocidade</span>
                                <p className="text-2xl font-extrabold text-on-surface">{stats?.timeSeconds ? `${stats.timeSeconds}s` : "Instante"}</p>
                            </div>
                            <div>
                                <span className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest">Viés</span>
                                <p className="text-2xl font-extrabold text-on-surface">Neutro</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-surface-variant/40 p-8 rounded-md border border-outline-variant/5 flex flex-col justify-center">
                        <p className="text-sm italic text-on-surface-variant leading-relaxed">
                            {candidates.length > 0
                                ? `"Dos ${candidates.length} candidatos analisados, ${counts.advance} possuem aderência forte à vaga (score ≥80). ${counts.discard > 0 ? `${counts.discard} perfis foram marcados para descarte por baixa aderência.` : ""}`
                                : `"O algoritmo identificou que 30% dos candidatos possuem skills em AWS não explicitadas no resumo, mas sugeridas pelo histórico."`
                            }
                        </p>
                        <div className="mt-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                            <span className="text-[10px] font-bold text-primary uppercase">Smart Insight</span>
                        </div>
                    </div>
                </section>

                {/* Floating Action Button (FAB) */}
                <button className="fixed bottom-8 right-8 w-14 h-14 bg-primary text-on-primary-fixed rounded-full shadow-2xl shadow-primary/40 hover:scale-110 active:scale-90 transition-all flex items-center justify-center">
                    <span className="material-symbols-outlined">chat_bubble</span>
                </button>
            </div>
    );
}
