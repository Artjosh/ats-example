import { FileStatus } from "../lib/types";

interface FileCardProps {
    name: string;
    size: number;
    status: FileStatus;
    onRemove: () => void;
}

function formatSize(bytes: number): string {
    if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(1)} MB`;
    return `${Math.round(bytes / 1024)} KB`;
}

function getStatusDisplay(status: FileStatus) {
    switch (status) {
        case "extracted":
            return { label: "Pronto ✓", color: "text-secondary", cardClass: "bg-surface-container border-transparent hover:border-outline-variant/10", iconBg: "bg-secondary/10", iconColor: "text-secondary" };
        case "extracting":
            return { label: "Extraindo texto...", color: "text-primary animate-pulse", cardClass: "bg-surface-container border-primary/20 bg-primary/5", iconBg: "bg-primary/10", iconColor: "text-primary" };
        case "error":
            return { label: "Erro na extração", color: "text-error", cardClass: "bg-surface-container border-error/20", iconBg: "bg-error/10", iconColor: "text-error" };
        default:
            return { label: "Pendente", color: "text-on-surface-variant", cardClass: "bg-surface-container-low/50 border-outline-variant/5", iconBg: "bg-surface-container-high", iconColor: "text-on-surface-variant" };
    }
}

export default function FileCard({ name, size, status, onRemove }: FileCardProps) {
    const display = getStatusDisplay(status);

    return (
        <div className={`rounded-md p-4 flex items-center gap-4 group transition-all duration-200 border ${display.cardClass}`}>
            <div className={`w-10 h-10 rounded-md ${display.iconBg} flex items-center justify-center`}>
                <span className={`material-symbols-outlined ${display.iconColor}`}>description</span>
            </div>
            <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold truncate ${status === "pending" ? "text-on-surface-variant" : "text-on-surface"}`}>{name}</p>
                <p className="text-[11px] text-on-surface-variant">
                    {formatSize(size)} • <span className={display.color}>{display.label}</span>
                </p>
            </div>
            <button onClick={onRemove} className="text-on-surface-variant hover:text-error transition-colors p-1">
                <span className="material-symbols-outlined text-lg">close</span>
            </button>
        </div>
    );
}
