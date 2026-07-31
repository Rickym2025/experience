export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#050508] text-white flex flex-col items-center justify-center p-6 text-center font-sans">
      <h1 className="text-3xl font-black mb-2">RM Studio Experience Engine</h1>
      <p className="text-xs text-gray-400 max-w-md mb-6">Piattaforma di Smart Experience per Ristoranti e Attività Locali.</p>

      {/* 🚀 LINK AL BLOG EXPERIENCE */}
      <a 
        href="https://blogs.rmstudio.app/experience/" 
        target="_blank" 
        rel="noopener noreferrer"
        className="px-5 py-2.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 font-bold text-xs hover:bg-teal-500/20 transition-all flex items-center gap-2"
      >
        <span>📖</span> Esplora il Blog Horeca & Ristorazione
      </a>
    </div>
  );
}
