import React from "react";

const InstagramIcon = () => (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /></svg>
);
const LinkedinIcon = () => (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect width="4" height="12" x="2" y="9" /><circle cx="4" cy="4" r="2" /></svg>
);

export default function LandingFooter() {
  return (
    <footer className="border-t border-white/10 bg-black py-16 px-6 relative z-10 text-xs text-stone-500">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 text-center md:text-left">
        
        <div className="md:col-span-2 space-y-3">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-400 shadow-[0_0_10px_#fbbf24]"></span>
            <span className="font-extrabold text-white text-base tracking-tight">Experience Engine</span>
          </div>
          <p className="text-stone-400 text-xs leading-relaxed max-w-sm">
            Ingegneria dei Sistemi Autonomi. Semplifichiamo l&apos;esperienza culinaria e la vendita al tavolo attraverso Smart Menu interattivi.
          </p>
          <div className="pt-2 flex flex-wrap gap-3 justify-center md:justify-start">
            <span>© {new Date().getFullYear()} RM Studio. Tutti i diritti riservati.</span>
            <span>|</span>
            <a href="https://rmstudio.app/privacy.html" target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 underline">Privacy Policy</a>
            <span>|</span>
            <a href="https://rmstudio.app/termini.html" target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 underline">Termini</a>
          </div>
        </div>

        <div>
          <h4 className="text-white font-bold uppercase tracking-wider mb-3 text-xs">Piattaforme RM Studio</h4>
          <ul className="space-y-2 text-stone-400">
            <li><a href="https://concierge24.rmstudio.app" target="_blank" rel="noopener noreferrer" className="hover:text-amber-400">Concierge24 (Hospitality)</a></li>
            <li><a href="https://hometour.rmstudio.app" target="_blank" rel="noopener noreferrer" className="hover:text-amber-400">HomeTour AI (Immobiliare)</a></li>
            <li><a href="https://drivemotion.rmstudio.app" target="_blank" rel="noopener noreferrer" className="hover:text-amber-400">DriveMotion (Automotive)</a></li>
            <li><a href="https://blogs.rmstudio.app/experience/" target="_blank" rel="noopener noreferrer" className="text-amber-400 font-bold hover:underline">Blog Experience Horeca</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold uppercase tracking-wider mb-3 text-xs">Social Hub</h4>
          <div className="flex justify-center md:justify-start gap-3">
            <a href="https://www.instagram.com/riccardo_mode_/" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg bg-stone-900 border border-stone-800 flex items-center justify-center hover:text-amber-400 transition"><InstagramIcon /></a>
            <a href="https://www.linkedin.com/in/riccardo-modena-13918a61/" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg bg-stone-900 border border-stone-800 flex items-center justify-center hover:text-amber-400 transition"><LinkedinIcon /></a>
          </div>
        </div>

      </div>
    </footer>
  );
}
