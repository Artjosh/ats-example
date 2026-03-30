"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useApp } from "../context/AppContext";

// ── Tutorial Steps Definition ──────────────────────────────────
interface TutorialStep {
    targetId: string;
    page: string;
    title: string;
    description: string;
    position: "bottom" | "top" | "left" | "right";
    icon: string;
}

const STEPS: TutorialStep[] = [
    {
        targetId: "tutorial-mock-toggle",
        page: "/",
        title: "Modo MOCK vs LIVE",
        description: "Alterne entre modo demonstração e produção. No MOCK, o app exibe dados fictícios para você explorar a interface. No LIVE, use seus próprios currículos e a IA analisa de verdade.",
        position: "bottom",
        icon: "toggle_on",
    },
    {
        targetId: "tutorial-requirements",
        page: "/",
        title: "Requisitos da Vaga",
        description: "Cole aqui a descrição completa da vaga — responsabilidades, competências técnicas e soft skills. Quanto mais detalhados os requisitos, mais precisa será a análise da IA.",
        position: "bottom",
        icon: "edit_note",
    },
    {
        targetId: "tutorial-provider",
        page: "/",
        title: "Provedor de IA",
        description: "Escolha qual modelo de IA vai analisar os currículos. O Puter.js é 100% gratuito e não precisa de nenhuma chave de API! Basta selecionar e usar.",
        position: "top",
        icon: "model_training",
    },
    {
        targetId: "tutorial-upload-zone",
        page: "/upload",
        title: "Upload de Currículos",
        description: "Arraste os currículos em PDF ou DOCX para esta área, ou clique para selecionar os arquivos. O sistema extrai o texto automaticamente — sem OCR necessário.",
        position: "bottom",
        icon: "cloud_upload",
    },
    {
        targetId: "tutorial-analyze-btn",
        page: "/upload",
        title: "Iniciar Análise",
        description: "Quando todos os arquivos estiverem carregados, clique aqui. A IA vai ler cada currículo, comparar com os requisitos da vaga e pontuar de 0 a 100.",
        position: "top",
        icon: "rocket_launch",
    },
    {
        targetId: "tutorial-dashboard-filters",
        page: "/dashboard",
        title: "Filtre e Compare",
        description: "Use os filtros para ver apenas candidatos recomendados (Avançar), pendentes (Analisar) ou descartados. O slider de score mínimo ajusta o corte em tempo real.",
        position: "bottom",
        icon: "filter_list",
    },
];

const STORAGE_KEY = "smartscreen-tutorial-dismissed";

// ── Component ──────────────────────────────────────────────────
export default function TutorialOverlay() {
    const router = useRouter();
    const pathname = usePathname();
    const { mockMode, toggleMockMode } = useApp();
    const [currentStep, setCurrentStep] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
    const [isAnimating, setIsAnimating] = useState(false);
    const observerRef = useRef<MutationObserver | null>(null);

    // Check if tutorial was dismissed
    useEffect(() => {
        const dismissed = localStorage.getItem(STORAGE_KEY);
        if (!dismissed) {
            // Delay to let page render first
            const timer = setTimeout(() => setIsVisible(true), 800);
            return () => clearTimeout(timer);
        }
    }, []);

    // Find and track target element
    const updateTargetRect = useCallback(() => {
        const step = STEPS[currentStep];
        if (!step || !isVisible) return;

        const el = document.getElementById(step.targetId);
        if (el) {
            const rect = el.getBoundingClientRect();
            setTargetRect(rect);
        } else {
            setTargetRect(null);
        }
    }, [currentStep, isVisible]);

    useEffect(() => {
        if (!isVisible) return;

        updateTargetRect();

        // Watch for DOM changes (page transitions)
        observerRef.current = new MutationObserver(updateTargetRect);
        observerRef.current.observe(document.body, { childList: true, subtree: true });

        window.addEventListener("resize", updateTargetRect);
        window.addEventListener("scroll", updateTargetRect);

        return () => {
            observerRef.current?.disconnect();
            window.removeEventListener("resize", updateTargetRect);
            window.removeEventListener("scroll", updateTargetRect);
        };
    }, [isVisible, currentStep, updateTargetRect]);

    // Navigate to correct page when step changes
    useEffect(() => {
        if (!isVisible) return;
        const step = STEPS[currentStep];
        if (!step) return;

        // Ensure mock mode is on for dashboard step (so filters are visible)
        if (step.page === "/dashboard" && !mockMode) {
            toggleMockMode();
        }

        if (step.page !== pathname) {
            // Need to navigate to the right page
            setIsAnimating(true);
            router.push(step.page);
        } else {
            // We're on the correct page — make sure tooltip is visible and positioned
            const timer = setTimeout(() => {
                updateTargetRect();
                setIsAnimating(false);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [currentStep, isVisible, pathname, router, updateTargetRect, mockMode, toggleMockMode]);

    const handleNext = () => {
        if (currentStep < STEPS.length - 1) {
            setIsAnimating(true);
            setTimeout(() => {
                setCurrentStep(prev => prev + 1);
                setIsAnimating(false);
            }, 200);
        } else {
            handleDismiss();
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setIsAnimating(true);
            setTimeout(() => {
                setCurrentStep(prev => prev - 1);
                setIsAnimating(false);
            }, 200);
        }
    };

    const handleDismiss = () => {
        setIsVisible(false);
        localStorage.setItem(STORAGE_KEY, "true");
        // Dispatch event so the "?" button can appear
        window.dispatchEvent(new CustomEvent("tutorial-dismissed"));
    };

    // Public method to restart tutorial (called from "?" button)
    useEffect(() => {
        const handleRestart = () => {
            setCurrentStep(0);
            setIsVisible(true);
            // Navigate to first page
            if (pathname !== "/") router.push("/");
        };
        window.addEventListener("restart-tutorial", handleRestart);
        return () => window.removeEventListener("restart-tutorial", handleRestart);
    }, [pathname, router]);

    if (!isVisible) return null;

    const step = STEPS[currentStep];
    const isOnCorrectPage = step.page === pathname;

    // Calculate tooltip position
    let tooltipStyle: React.CSSProperties = {};
    if (targetRect && isOnCorrectPage) {
        const pad = 16;
        switch (step.position) {
            case "bottom":
                tooltipStyle = {
                    top: targetRect.bottom + pad,
                    left: Math.max(16, Math.min(targetRect.left + targetRect.width / 2 - 180, window.innerWidth - 376)),
                };
                break;
            case "top":
                tooltipStyle = {
                    bottom: window.innerHeight - targetRect.top + pad,
                    left: Math.max(16, Math.min(targetRect.left + targetRect.width / 2 - 180, window.innerWidth - 376)),
                };
                break;
            case "right":
                tooltipStyle = {
                    top: targetRect.top + targetRect.height / 2 - 60,
                    left: targetRect.right + pad,
                };
                break;
            case "left":
                tooltipStyle = {
                    top: targetRect.top + targetRect.height / 2 - 60,
                    right: window.innerWidth - targetRect.left + pad,
                };
                break;
        }
    } else {
        // Center fallback
        tooltipStyle = {
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
        };
    }

    return (
        <div className="fixed inset-0 z-[9999]">
            {/* Overlay with spotlight cutout */}
            <svg className="fixed inset-0 w-full h-full" style={{ pointerEvents: "none" }}>
                <defs>
                    <mask id="tutorial-mask">
                        <rect width="100%" height="100%" fill="white" />
                        {targetRect && isOnCorrectPage && (
                            <rect
                                x={targetRect.left - 8}
                                y={targetRect.top - 8}
                                width={targetRect.width + 16}
                                height={targetRect.height + 16}
                                rx="12"
                                fill="black"
                            />
                        )}
                    </mask>
                </defs>
                <rect
                    width="100%"
                    height="100%"
                    fill="rgba(0,0,0,0.7)"
                    mask="url(#tutorial-mask)"
                    style={{ pointerEvents: "auto" }}
                    onClick={(e) => e.stopPropagation()}
                />
            </svg>

            {/* Spotlight ring glow */}
            {targetRect && isOnCorrectPage && (
                <div
                    className="fixed rounded-xl border-2 border-[#aca3ff]/60 shadow-[0_0_30px_rgba(172,163,255,0.3),inset_0_0_30px_rgba(172,163,255,0.05)] pointer-events-none transition-all duration-500"
                    style={{
                        left: targetRect.left - 8,
                        top: targetRect.top - 8,
                        width: targetRect.width + 16,
                        height: targetRect.height + 16,
                    }}
                />
            )}

            {/* Tooltip Card */}
            <div
                className={`fixed z-[10000] w-[360px] bg-[#1a1c2e] border border-[#aca3ff]/30 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.6),0_0_40px_rgba(172,163,255,0.15)] transition-all duration-300 ${
                    isAnimating ? "opacity-0 scale-95" : "opacity-100 scale-100"
                }`}
                style={tooltipStyle}
            >
                {/* Header */}
                <div className="flex items-center gap-3 px-5 pt-5 pb-3">
                    <div className="w-10 h-10 rounded-xl bg-[#aca3ff]/15 flex items-center justify-center">
                        <span className="material-symbols-outlined text-[#aca3ff] text-xl">{step.icon}</span>
                    </div>
                    <div className="flex-1">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#aca3ff]/60">
                            Passo {currentStep + 1} de {STEPS.length}
                        </p>
                        <h3 className="text-base font-bold text-[#e5e4ed]">{step.title}</h3>
                    </div>
                    <button
                        onClick={handleDismiss}
                        className="text-[#aaaab3] hover:text-[#e5e4ed] transition-colors"
                    >
                        <span className="material-symbols-outlined text-lg">close</span>
                    </button>
                </div>

                {/* Description */}
                <p className="px-5 pb-4 text-sm text-[#aaaab3] leading-relaxed">
                    {step.description}
                </p>

                {/* Progress bar */}
                <div className="px-5 pb-3">
                    <div className="flex gap-1.5">
                        {STEPS.map((_, i) => (
                            <div
                                key={i}
                                className={`h-1 rounded-full flex-1 transition-all duration-300 ${
                                    i <= currentStep ? "bg-[#aca3ff]" : "bg-[#2a2c3e]"
                                }`}
                            />
                        ))}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between px-5 pb-5 pt-1">
                    <button
                        onClick={handleDismiss}
                        className="text-xs text-[#aaaab3] hover:text-[#e5e4ed] transition-colors"
                    >
                        Não mostrar novamente
                    </button>
                    <div className="flex gap-2">
                        {currentStep > 0 && (
                            <button
                                onClick={handlePrev}
                                className="px-4 py-2 text-xs font-semibold text-[#aaaab3] hover:text-[#e5e4ed] rounded-lg hover:bg-[#2a2c3e] transition-all"
                            >
                                Voltar
                            </button>
                        )}
                        <button
                            onClick={handleNext}
                            className="px-5 py-2 text-xs font-bold text-white bg-[#6C5CE7] hover:bg-[#7c6ef7] rounded-lg transition-all shadow-md shadow-[#6C5CE7]/25"
                        >
                            {currentStep === STEPS.length - 1 ? "Concluir ✓" : "Próximo →"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
