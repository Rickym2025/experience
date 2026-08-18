import React from "react";

export default function LandingNavbar() {
  return (
    <nav className="fixed top-0 inset-x-0 z-50 bg-black/60 backdrop-blur-xl border-b border-white/10 px-6 py-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <a href="#" className="flex items-center gap-2.5 group">
          <span className="w-3.5 h-3.5 rounded-full bg-amber-400 shadow-[0_0_12px_#fbbf24] animate-pulse"></span>
          <span className="font-extrabold text-white tracking-tight text-lg">
            Experience <span className="text-amber-400 font-serif italic text-sm">Engine</span>
          </span>
        </a>

        {/* Pillole Ecosistema RM */}
        <div className="hidden lg:flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-3 py-1 text-xs">
          <span className="text-stone-500 font-semibold px-2">Ecosistema RM:</span>
          <a href="https://concierge24.rmstudio.app" target="_blank" rel="noopener" className="text-stone-400 hover:text-amber-400 px-2 py-0.5 rounded-full hover:bg-white/5 transition">Concierge24</a>
          <a href="https://dentis.rmstudio.app" target="_blank" rel="noopener" className="text-stone-400 hover:text-amber-400 px-2 py-0.5 rounded-full hover:bg-white/5 transition">Dentis AI</a>
          <a href="https://drivemotion.rmstudio.app" target="_blank" rel="noopener" className="text-stone-400 hover:text-amber-400 px-2 py-0.5 rounded-full hover:bg-white/5 transition">DriveMotion</a>
        </div>

        <div className="flex items-center gap-4 text-xs font-bold">
          <a href="https://blogs.rmstudio.app/experience/" target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:text-white transition hidden sm:inline">
            Blog Horeca
          </a>
          <a href="#pricing" className="bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-black px-5 py-2 rounded-full transition shadow-lg shadow-amber-500/20 uppercase tracking-wider text-xs font-bold">
              Sblocca Locale 🚀
          </a>
        </div>
      </div>
    </nav>
  );
}
