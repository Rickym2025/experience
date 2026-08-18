"use client";

import React, { useEffect, useRef } from "react";

export default function LandingOrbit() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("https://raw.githubusercontent.com/Rickym2025/mrstudio/main/public/orbit-template.html")
      .then((res) => res.text())
      .then((html) => {
        if (containerRef.current) containerRef.current.innerHTML = html;
      })
      .catch((err) => console.error("Errore orbitale:", err));
  }, []);

  return (
    <section id="ecosistema" className="border-t border-white/10 bg-[#020202]/90 py-24 px-6 relative z-10">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-12 gap-16 items-center">
        
        {/* Widget Orbitale */}
        <div 
          ref={containerRef} 
          className="lg:col-span-5 flex justify-center items-center relative min-h-[440px]" 
          id="orbit-template-container"
        />

        {/* Profilo Autorevolezza RM Studio */}
        <div className="lg:col-span-7 space-y-6 text-left">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-widest">
            Esperienza & Autorevolezza
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
            Tecnologia proprietaria firmata <span className="text-amber-400">RM Studio</span>
          </h2>
          
          <p className="text-stone-300 text-base sm:text-lg leading-relaxed font-light">
            Sviluppato dal programmatore <b>Riccardo Modena</b>, Experience Engine fa parte di un ecosistema integrato di software avanzati dedicati all&apos;innovazione B2B nel settore Horeca e turistico.
          </p>
          
          <p className="text-stone-400 text-sm leading-relaxed">
            In linea con le linee guida internazionali sull&apos;IA applicata alla ristorazione, la narrazione asincrona e l&apos;abbinamento automatico valorizzano le eccellenze del territorio migliorando la fidelizzazione del cliente.
          </p>

          <div className="pt-2">
            <a 
              href="https://www.linkedin.com/in/riccardo-modena-13918a61/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white font-bold px-6 py-3 rounded-full text-xs transition border border-white/10"
            >
              <span>Segui Riccardo Modena su LinkedIn</span>
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}
