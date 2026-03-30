"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useApp } from "./context/AppContext";
import { MOCK_JOB_REQUIREMENTS } from "./lib/mockData";

export default function JobConfigPage() {
    const router = useRouter();
    const { mockMode, jobConfig, setJobConfig } = useApp();
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");

    const isPuter = jobConfig.provider === "puter";

    // When switching to mock mode, prefill data
    useEffect(() => {
        if (mockMode) {
            setJobConfig({
                requirements: MOCK_JOB_REQUIREMENTS,
                provider: "puter",
                apiKey: "mock-key-demo",
            });
        }
    }, [mockMode, setJobConfig]);

    const handleNext = () => {
        if (!mockMode) {
            if (!jobConfig.requirements.trim()) {
                setError("Cole os requisitos da vaga antes de prosseguir.");
                return;
            }
            if (!isPuter && !jobConfig.apiKey.trim()) {
                setError("Insira a chave da API para análise.");
                return;
            }
        }
        setError("");
        router.push("/upload");
    };

    return (
        <div className="pt-32 pb-20 px-6 flex flex-col items-center min-h-screen">
            <div className="w-full max-w-[720px]">
                <header className="mb-10 text-center md:text-left">
                    <h1 className="text-4xl md:text-5xl font-headline font-bold text-on-background tracking-tight mb-3">
                        Configure a Vaga
                    </h1>
                    <p className="text-lg text-on-surface-variant font-body">
                        Cole os requisitos e a IA vai analisar os currículos automaticamente
                    </p>
                </header>

                <div className="space-y-8">
                    <section id="tutorial-requirements" className="bg-surface-container-low rounded-md p-6 shadow-lg">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="material-symbols-outlined text-primary text-sm">edit_note</span>
                            <label className="text-[11px] font-medium uppercase tracking-wider text-on-surface-variant">Requisitos da Vaga</label>
                        </div>
                        <textarea
                            value={jobConfig.requirements}
                            onChange={(e) => { setJobConfig({ requirements: e.target.value }); setError(""); }}
                            className="w-full min-h-[240px] bg-surface-container-highest border-none rounded-md p-4 text-on-surface placeholder:text-outline/50 focus:ring-2 focus:ring-secondary/40 transition-all font-body leading-relaxed resize-none"
                            placeholder="Cole aqui a descrição da vaga, responsabilidades e competências técnicas desejadas...">
                        </textarea>
                    </section>

                    <section id="tutorial-provider" className={`grid grid-cols-1 ${isPuter ? "" : "md:grid-cols-3"} gap-4`}>
                        <div className={`bg-surface-container-low rounded-md p-6 ${isPuter ? "" : "md:col-span-1"}`}>
                            <div className="flex items-center gap-2 mb-4">
                                <span className="material-symbols-outlined text-primary text-sm">model_training</span>
                                <label className="text-[11px] font-medium uppercase tracking-wider text-on-surface-variant">Provider</label>
                            </div>
                            <div className="relative">
                                <select
                                    value={jobConfig.provider}
                                    onChange={(e) => setJobConfig({ provider: e.target.value as "openai" | "anthropic" | "google" | "puter" })}
                                    className="w-full bg-surface-container-highest border-none rounded-md py-3 px-4 text-on-surface appearance-none focus:ring-2 focus:ring-secondary/40 cursor-pointer font-medium"
                                >
                                    <option value="puter">🆓 Puter.js (Grátis / Sem Key)</option>
                                    <option value="google">Google Gemini</option>
                                    <option value="openai">OpenAI</option>
                                    <option value="anthropic">Anthropic</option>
                                </select>
                                <span className="material-symbols-outlined absolute right-3 top-3 pointer-events-none text-on-surface-variant">unfold_more</span>
                            </div>
                            {isPuter && (
                                <p className="mt-3 text-[12px] text-secondary flex items-center gap-1.5">
                                    <span className="material-symbols-outlined text-[14px]">check_circle</span>
                                    Sem necessidade de chave de API — 100% gratuito via Puter.js
                                </p>
                            )}
                        </div>

                        {!isPuter && (
                            <div className="bg-surface-container-low rounded-md p-6 md:col-span-2">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary text-sm">vpn_key</span>
                                        <label className="text-[11px] font-medium uppercase tracking-wider text-on-surface-variant">Chave da API</label>
                                    </div>
                                    <span className="text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded-full">Secure Connection</span>
                                </div>
                                <div className="relative group">
                                    <input
                                        value={jobConfig.apiKey}
                                        onChange={(e) => { setJobConfig({ apiKey: e.target.value }); setError(""); }}
                                        className="w-full bg-surface-container-highest border-none rounded-md py-3 pl-4 pr-12 text-on-surface placeholder:text-outline/50 focus:ring-2 focus:ring-secondary/40 transition-all font-mono"
                                        placeholder="sk-••••••••••••••••"
                                        type={showPassword ? "text" : "password"}
                                    />
                                    <button
                                        className="absolute right-4 top-3 text-on-surface-variant hover:text-on-surface transition-colors"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        <span className="material-symbols-outlined text-[20px]">{showPassword ? "visibility_off" : "visibility"}</span>
                                    </button>
                                </div>
                                <p className="mt-3 text-[12px] text-on-surface-variant flex items-center gap-1.5">
                                    <span className="material-symbols-outlined text-[14px]">info</span>
                                    Sua chave não é armazenada em servidor
                                </p>
                            </div>
                        )}
                    </section>

                    {error && (
                        <div className="bg-error/10 border border-error/20 rounded-md px-4 py-3 text-error text-sm flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">error</span>
                            {error}
                        </div>
                    )}

                    <div className="pt-4 group">
                        <button
                            onClick={handleNext}
                            className="signature-gradient w-full py-5 rounded-md text-on-primary-fixed font-semibold text-lg flex items-center justify-center gap-3 transition-all duration-300 hover:scale-[1.01] active:scale-[0.98] hover:shadow-[0_0_30px_rgba(172,163,255,0.4)] relative overflow-hidden"
                        >
                            <span>Próximo: Upload de Currículos</span>
                            <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                        </button>
                    </div>
                </div>

                <div className="mt-20 flex justify-center opacity-30">
                    <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-outline-variant to-transparent"></div>
                </div>
            </div>
        </div>
    );
}
