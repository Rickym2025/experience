import React from "react";
import Image from "next/image";

export default function LandingNavbar() {
  return (
    <nav className="fixed top-0 inset-x-0 z-50 bg-black/70 backdrop-blur-xl border-b border-white/10 px-6 py-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Brand & Logo */}
        <a href="#" className="flex items-center gap-3 group">
          <Image
            src="/logo_experience.png"
            alt="Experience Engine Logo"
            width={32}
            height={32}
            className="w-8 h-8 object-contain rounded-lg transition-transform group-hover:scale-105"
            priority
          />
          <span className="font-extrabold text-white tracking-tight text-lg">
            Experience <span className="text-amber-400 font-serif italic text-sm">Engine</span>
          </span>
        </a>

        {/* Navigazione Interna di Valore (Sostituisce i vecchi link SaaS) */}
        <div className="hidden md:flex items-center gap-6 text-xs font-semibold text-stone-300">
          <a href="#features" className="hover:text-amber-400 transition">
            Caratteristiche
          </a>
          <a href="#sommelier" className="hover:text-amber-400 transition">
            Sommelier AI &amp; Cantina
          </a>
          <a href="#pricing" className="hover:text-amber-400 transition">
            Listino Prezzi
          </a>
          <a href="#faq" className="hover:text-amber-400 transition">
            FAQ
          </a>
          <a
            href="https://blogs.rmstudio.app/experience/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-400/90 hover:text-amber-300 transition"
          >
            Blog Horeca
          </a>
        </div>

        {/* CTA Principale */}
        <div className="flex items-center gap-3">
          <a
            href="#pricing"
            className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 px-5 py-2.5 rounded-full transition-all shadow-lg shadow-amber-500/20 uppercase tracking-wider text-xs font-black cursor-pointer active:scale-95"
          >
            Sblocca Locale 🚀
          </a>
        </div>
      </div>
    </nav>
  );
}
