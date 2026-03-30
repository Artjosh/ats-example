const SideNavBar = () => {
    return (
        <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-64 flex-col py-6 gap-4 bg-[#11131a] border-r border-[#46484f]/15 mt-16 z-40">
            <div className="px-6 mb-4">
                <h2 className="text-[#aca3ff] font-bold text-sm uppercase tracking-widest">Recruiter Portal</h2>
                <p className="text-[10px] text-[#00D2D3] font-medium">AI-Matching Active</p>
            </div>
            <div className="flex flex-col gap-1 px-2">
                <a className="flex items-center gap-3 py-3 px-4 bg-[#1d1f27] text-[#aca3ff] rounded-md transition-all" href="#">
                    <span className="material-symbols-outlined">filter_list</span>
                    <span className="font-['Inter'] text-[13px] font-medium">Pipeline</span>
                </a>
                <a className="flex items-center gap-3 py-3 px-4 text-[#aaaab3] hover:bg-[#1d1f27]/50 rounded-md transition-all" href="#">
                    <span className="material-symbols-outlined">group</span>
                    <span className="font-['Inter'] text-[13px] font-medium">Candidates</span>
                </a>
                <a className="flex items-center gap-3 py-3 px-4 text-[#aaaab3] hover:bg-[#1d1f27]/50 rounded-md transition-all" href="#">
                    <span className="material-symbols-outlined">settings</span>
                    <span className="font-['Inter'] text-[13px] font-medium">Settings</span>
                </a>
            </div>
            <div className="mt-auto px-4">
                <button className="w-full py-3 bg-gradient-to-br from-primary to-primary-dim text-on-primary-fixed font-bold rounded-md text-sm shadow-lg shadow-primary/10 hover:scale-[1.02] active:scale-[0.98] transition-all">
                    Create New Job
                </button>
                <div className="mt-6 border-t border-outline-variant/10 pt-4 flex items-center gap-3 px-2 text-[#aaaab3] cursor-pointer hover:text-on-background">
                    <span className="material-symbols-outlined">help</span>
                    <span className="text-[13px]">Help Center</span>
                </div>
            </div>
        </aside>
    );
};

export default SideNavBar;
