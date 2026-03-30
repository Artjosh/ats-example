import { CandidateResult } from "../lib/types";

function getScoreBadge(score: number) {
    if (score >= 80) return {
        bg: "bg-gradient-to-br from-secondary to-on-secondary",
        text: "text-on-secondary-container",
        pulse: true,
    };
    if (score >= 60) return {
        bg: "bg-gradient-to-br from-primary to-inverse-primary",
        text: "text-on-primary-container",
        pulse: false,
    };
    return {
        bg: "bg-surface-variant border border-outline-variant/20",
        text: "text-on-surface-variant",
        pulse: false,
    };
}

function getRecommendation(rec: string) {
    switch (rec) {
        case "AVANÇAR":
            return { color: "text-secondary", icon: "check_circle", label: "AVANÇAR" };
        case "ANALISAR":
            return { color: "text-primary", icon: "search", label: "ANALISAR" };
        default:
            return { color: "text-error", icon: "cancel", label: "DESCARTAR" };
    }
}

export default function CandidateCard({ candidate }: { candidate: CandidateResult }) {
    const badge = getScoreBadge(candidate.score);
    const rec = getRecommendation(candidate.recommendation);

    return (
        <div className="group relative bg-surface-container-high p-8 rounded-[1.5rem] transition-all duration-300 hover:scale-[1.01] hover:bg-surface-bright hover:shadow-[0_12px_40px_rgba(0,0,0,0.5),0_0_1px_rgba(172,163,255,0.2)]">
            <div className="absolute top-6 right-6">
                <div className={`${badge.bg} px-4 py-1.5 rounded-full flex items-center gap-2 shadow-lg ${badge.pulse ? "animate-pulse" : ""}`}>
                    <span className={`text-sm font-black ${badge.text} tracking-tighter`}>{candidate.score}</span>
                    <span className={`text-[8px] font-bold ${badge.text} uppercase`}>Match</span>
                </div>
            </div>
            <div className="flex items-start gap-6">
                {candidate.imageUrl ? (
                    <img alt="Candidate" className="w-20 h-20 rounded-md object-cover bg-surface-variant" src={candidate.imageUrl} />
                ) : (
                    <div className="w-20 h-20 rounded-md bg-surface-container-lowest flex items-center justify-center text-on-surface-variant/20">
                        <span className="material-symbols-outlined text-4xl">person</span>
                    </div>
                )}
                <div className="flex-1">
                    <h3 className="text-2xl font-bold text-on-surface mb-1 leading-tight tracking-tight">{candidate.name}</h3>
                    <p className="text-on-surface-variant text-sm leading-relaxed mb-4 max-w-md">{candidate.summary}</p>
                    <div className="flex flex-wrap gap-2 mb-6">
                        {candidate.strengths.map((s, i) => (
                            <span key={`s-${i}`} className="px-3 py-1 bg-secondary/10 text-secondary text-[11px] font-bold rounded-md uppercase tracking-wide">{s}</span>
                        ))}
                        {candidate.gaps.map((g, i) => (
                            <span key={`g-${i}`} className="px-3 py-1 bg-error/10 text-error text-[11px] font-bold rounded-md uppercase tracking-wide">{g}</span>
                        ))}
                    </div>
                </div>
            </div>
            <div className="pt-6 border-t border-outline-variant/10 flex justify-between items-center">
                <div className={`flex items-center gap-2 ${rec.color} font-black text-[11px] tracking-widest`}>
                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>{rec.icon}</span>
                    {rec.label}
                </div>
                <button className="p-2 text-on-surface-variant hover:text-primary transition-colors">
                    <span className="material-symbols-outlined">visibility</span>
                </button>
            </div>
        </div>
    );
}
