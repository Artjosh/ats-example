// --- Shared Types for SmartScreen ATS ---

export type Provider = "openai" | "anthropic" | "google" | "puter";
export type FileStatus = "pending" | "extracting" | "extracted" | "error";
export type Recommendation = "AVANÇAR" | "ANALISAR" | "DESCARTAR";

export interface JobConfig {
    requirements: string;
    provider: Provider;
    apiKey: string;
}

export interface FileItem {
    id: string;
    name: string;
    size: number;
    file: File;
    status: FileStatus;
    extractedText?: string;
    error?: string;
}

export interface CandidateResult {
    id: string;
    fileName: string;
    name: string;
    score: number;
    summary: string;
    strengths: string[];
    gaps: string[];
    recommendation: Recommendation;
    imageUrl?: string;
}

export interface AnalysisStats {
    total: number;
    qualified: number;
    analyze: number;
    discard: number;
    timeSeconds: number;
    averageScore: number;
}

export interface AppState {
    mockMode: boolean;
    jobConfig: JobConfig;
    files: FileItem[];
    results: CandidateResult[];
    analysisStats: AnalysisStats | null;
    isAnalyzing: boolean;
    analysisProgress: { current: number; total: number } | null;
}
