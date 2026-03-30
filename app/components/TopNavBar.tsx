"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "../context/AppContext";
import { useState, useEffect } from "react";

const TopNavBar = () => {
    const pathname = usePathname();
    const { mockMode, toggleMockMode } = useApp();
    const [showHelp, setShowHelp] = useState(false);

    useEffect(() => {
        // Show "?" if tutorial was previously dismissed
        const dismissed = localStorage.getItem("smartscreen-tutorial-dismissed");
        if (dismissed) setShowHelp(true);

        const handleDismissed = () => setShowHelp(true);
        window.addEventListener("tutorial-dismissed", handleDismissed);
        return () => window.removeEventListener("tutorial-dismissed", handleDismissed);
    }, []);

    const restartTutorial = () => {
        window.dispatchEvent(new CustomEvent("restart-tutorial"));
        setShowHelp(false);
    };

    const getLinkClass = (path: string) => {
        const baseClass = "font-['Inter'] text-sm font-medium tracking-tight transition-colors ";
        return pathname === path
            ? baseClass + "text-[#aca3ff] border-b-2 border-[#aca3ff] pb-1"
            : baseClass + "text-[#aaaab3] hover:text-[#e5e4ed]";
    };

    return (
        <nav className="fixed top-0 z-50 w-full h-16 px-8 flex justify-between items-center bg-[#0c0e14]/80 backdrop-blur-3xl shadow-[0_4px_20px_rgba(0,0,0,0.4),0_0_1px_rgba(172,163,255,0.1)]">
            <div className="flex items-center gap-2 text-lg font-semibold text-[#e5e4ed]">
                <span className="material-symbols-outlined text-[#aca3ff] mr-1">description</span>
                <span className="font-headline tracking-tight">SmartScreen ATS</span>
                <span className="ml-2 text-[10px] bg-[#00D2D3] text-[#0c0e14] px-2 py-0.5 rounded-full font-bold">Beta</span>
            </div>
            <div className="hidden md:flex gap-8 absolute left-1/2 -translate-x-1/2">
                <Link href="/" className={getLinkClass("/")}>Job Configuration</Link>
                <Link href="/upload" className={getLinkClass("/upload")}>Resume Upload</Link>
                <Link href="/dashboard" className={getLinkClass("/dashboard")}>Results Dashboard</Link>
            </div>
            <div className="flex items-center gap-3">
                {/* Mock/Live Toggle */}
                <button
                    id="tutorial-mock-toggle"
                    onClick={toggleMockMode}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all duration-300 border ${
                        mockMode
                            ? "bg-[#6C5CE7]/20 border-[#6C5CE7]/40 text-[#aca3ff] hover:bg-[#6C5CE7]/30"
                            : "bg-secondary/15 border-secondary/30 text-secondary hover:bg-secondary/25"
                    }`}
                >
                    <span className={`w-2 h-2 rounded-full ${mockMode ? "bg-[#aca3ff]" : "bg-secondary animate-pulse"}`}></span>
                    {mockMode ? "MOCK" : "LIVE"}
                </button>
                {/* Help / Restart Tutorial */}
                {showHelp && (
                    <button
                        onClick={restartTutorial}
                        className="w-7 h-7 rounded-full border border-[#aca3ff]/30 bg-[#aca3ff]/10 text-[#aca3ff] text-xs font-bold flex items-center justify-center hover:bg-[#aca3ff]/20 hover:scale-110 transition-all"
                        title="Ver tutorial"
                    >
                        ?
                    </button>
                )}
            </div>
        </nav>
    );
};

export default TopNavBar;
