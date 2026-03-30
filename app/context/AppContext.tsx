"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { AppState, JobConfig, FileItem, CandidateResult, AnalysisStats, Provider } from "../lib/types";

interface AppContextType extends AppState {
    toggleMockMode: () => void;
    setJobConfig: (config: Partial<JobConfig>) => void;
    addFiles: (files: FileItem[]) => void;
    removeFile: (id: string) => void;
    updateFileStatus: (id: string, update: Partial<FileItem>) => void;
    clearFiles: () => void;
    setResults: (results: CandidateResult[], stats: AnalysisStats) => void;
    setIsAnalyzing: (v: boolean) => void;
    setAnalysisProgress: (p: { current: number; total: number } | null) => void;
    resetAll: () => void;
}

const initialState: AppState = {
    mockMode: true,
    jobConfig: { requirements: "", provider: "puter" as Provider, apiKey: "" },
    files: [],
    results: [],
    analysisStats: null,
    isAnalyzing: false,
    analysisProgress: null,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<AppState>(initialState);

    const toggleMockMode = useCallback(() => {
        setState(s => ({ ...s, mockMode: !s.mockMode }));
    }, []);

    const setJobConfig = useCallback((config: Partial<JobConfig>) => {
        setState(s => ({ ...s, jobConfig: { ...s.jobConfig, ...config } }));
    }, []);

    const addFiles = useCallback((files: FileItem[]) => {
        setState(s => ({ ...s, files: [...s.files, ...files] }));
    }, []);

    const removeFile = useCallback((id: string) => {
        setState(s => ({ ...s, files: s.files.filter(f => f.id !== id) }));
    }, []);

    const updateFileStatus = useCallback((id: string, update: Partial<FileItem>) => {
        setState(s => ({
            ...s,
            files: s.files.map(f => f.id === id ? { ...f, ...update } : f),
        }));
    }, []);

    const clearFiles = useCallback(() => {
        setState(s => ({ ...s, files: [] }));
    }, []);

    const setResults = useCallback((results: CandidateResult[], stats: AnalysisStats) => {
        setState(s => ({ ...s, results, analysisStats: stats }));
    }, []);

    const setIsAnalyzing = useCallback((v: boolean) => {
        setState(s => ({ ...s, isAnalyzing: v }));
    }, []);

    const setAnalysisProgress = useCallback((p: { current: number; total: number } | null) => {
        setState(s => ({ ...s, analysisProgress: p }));
    }, []);

    const resetAll = useCallback(() => {
        setState(s => ({ ...initialState, mockMode: s.mockMode }));
    }, []);

    return (
        <AppContext.Provider value={{
            ...state,
            toggleMockMode,
            setJobConfig,
            addFiles,
            removeFile,
            updateFileStatus,
            clearFiles,
            setResults,
            setIsAnalyzing,
            setAnalysisProgress,
            resetAll,
        }}>
            {children}
        </AppContext.Provider>
    );
}

export function useApp() {
    const ctx = useContext(AppContext);
    if (!ctx) throw new Error("useApp must be used within AppProvider");
    return ctx;
}
