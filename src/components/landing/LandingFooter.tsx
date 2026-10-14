import React from "react";
import Image from "next/image";

const InstagramIcon = () => (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
  </svg>
);

const LinkedinIcon = () => (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

export default function LandingFooter() {
  return (
    <footer className="border-t border-white/10 bg-black py-16 px-6 relative z-10 text-xs text-stone-500">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 text-center md:text-left">
        
        {/* Brand & Dati Aziendali */}
        <div className="md:col-span-1 space-y-3">
          <div className="flex items-center justify-center md:justify-start gap-2.5">
            <Image
              src="/logo_experience.png"
              alt="Experience Engine Logo"
              width={26}
              height={26}
              className="w-6 h-6 object-contain rounded opacity-90"
            />
            <span className="font-extrabold text-white text-base tracking-tight">Experience Engine</span>
          </div>
          <p className="text-stone-400 text-xs leading-relaxed">
            Storytelling Gastronomico d&apos;Autore, AI Sommelier &amp; Sound Identity per l&apos;alta ristorazione, cantine e resort.
          </p>
          <div className="text-[11px] text-stone-500 space-y-0.5 pt-1">
            <p>RM Studio di Riccardo Modena</p>
            <p>Ariano nel Polesine (RO) • P.IVA IT01633440386</p>
            <p className="text-amber-400/90 font-mono">riccardo@rmstudio.app</p>
          </div>
        </div>

        {/* Architettura dell'Esperienza */}
        <div>
          <h4 className="text-white font-bold uppercase tracking-wider mb-3 text-xs">Esperienza</h4>
          <ul className="space-y-2 text-stone-400">
            <li>
              <a href="#features" className="hover:text-amber-400 transition">Smart Menu d&apos;Autore</a>
            </li>
            <li>
              <a href="#sommelier" className="hover:text-amber-400 transition">AI Sommelier &amp; Cantina</a>
            </li>
            <li>
              <a href="#pricing" className="hover:text-amber-400 transition">Colonna Sonora Inedita SIAE</a>
            </li>
            <li>
              <a href="#pricing" className="hover:text-amber-400 transition">Privilege Club &amp; Recensioni</a>
            </li>
            <li>
              <a href="https://blogs.rmstudio.app/experience/" target="_blank" rel="noopener noreferrer" className="text-amber-400 font-bold hover:underline">
                Blog Experience Horeca
              </a>
            </li>
          </ul>
        </div>

        {/* Soluzioni B2B & Agenzie */}
        <div>
          <h4 className="text-white font-bold uppercase tracking-wider mb-3 text-xs">Soluzioni B2B</h4>
          <ul className="space-y-2 text-stone-400">
            <li>
              <a href="#pricing" className="hover:text-amber-400 transition">Fine Dining &amp; Stellati</a>
            </li>
            <li>
              <a href="#pricing" className="hover:text-amber-400 transition">Tenute Vinicole &amp; Wine Resort</a>
            </li>
            <li>
              <a href="https://portale.rmstudio.app" target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 transition">
                Partnership Agenzie di Comunicazione
              </a>
            </li>
            <li>
              <a href="https://wa.me/393495258418?text=Richiesta%20info%20Experience%20Engine" target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 transition">
                Assistenza Diretta WhatsApp
              </a>
            </li>
          </ul>
        </div>

        {/* Social & Legali */}
        <div className="space-y-4">
          <div>
            <h4 className="text-white font-bold uppercase tracking-wider mb-3 text-xs">Social &amp; Direzione</h4>
            <div className="flex justify-center md:justify-start gap-3">
              <a
                href="https://www.instagram.com/riccardo_mode_/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram Riccardo Modena"
                className="w-8 h-8 rounded-lg bg-stone-900 border border-stone-800 flex items-center justify-center hover:text-amber-400 transition"
              >
                <InstagramIcon />
              </a>
              <a
                href="https://www.linkedin.com/in/riccardo-modena-13918a61/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn Riccardo Modena"
                className="w-8 h-8 rounded-lg bg-stone-900 border border-stone-800 flex items-center justify-center hover:text-amber-400 transition"
              >
                <LinkedinIcon />
              </a>
            </div>
          </div>

          <div className="pt-2 text-[11px] text-stone-500 space-y-1">
            <p>© {new Date().getFullYear()} RM Studio. Diritti riservati.</p>
            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
              <a href="https://rmstudio.app/privacy.html" target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 underline">Privacy Policy</a>
              <span>•</span>
              <a href="https://rmstudio.app/termini.html" target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 underline">Termini di Servizio</a>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}
