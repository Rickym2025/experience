import { supabase } from '@/lib/supabase';
import { TasteExperience, MenuItem } from '@/types/experience';
import HeroExperience from '@/components/HeroExperience';
import InteractiveMenu from '@/components/InteractiveMenu';
import VibeGrid from '@/components/VibeGrid';
import NexusWidget from '@/components/NexusWidget';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 0; // Disabilita la cache per il test

export default async function ExperiencePage({ params }: PageProps) {
  const { slug } = await params;

  // 1. Recupera i dati del Ristorante
  const { data: experience, error: expError } = await supabase
    .from('taste_experiences')
    .select('*')
    .eq('slug', slug)
    .single();

  // REPORT DIAGNOSTICO SE C'È UN ERRORE
  if (expError || !experience) {
    return (
      <div className="p-8 font-mono text-xs text-red-400 bg-black min-h-screen">
        <h1 className="text-lg font-bold text-white mb-4">🔍 Report Diagnostico Debug</h1>
        <p className="mb-2"><strong>Slug richiesto:</strong> {slug}</p>
        <p className="mb-2"><strong>NEXT_PUBLIC_SUPABASE_URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Presente' : '❌ MANCANTE SU VERCEL'}</p>
        <p className="mb-2"><strong>NEXT_PUBLIC_SUPABASE_ANON_KEY:</strong> {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Presente' : '❌ MANCANTE SU VERCEL'}</p>
        <p className="mb-4"><strong>Errore Supabase:</strong> {JSON.stringify(expError, null, 2) || 'Nessun errore ma nessun record trovato'}</p>
      </div>
    );
  }

  // 2. Recupera il Menu associato
  const { data: menuItems } = await supabase
    .from('taste_menus')
    .select('*')
    .eq('experience_slug', slug)
    .order('categoria', { ascending: true });

  const expData = experience as TasteExperience;
  const items = (menuItems || []) as MenuItem[];

  return (
    <main className="min-h-screen bg-[#050508] text-gray-100 selection:bg-amber-500 selection:text-black">
      <HeroExperience experience={expData} />

      <div className="max-w-5xl mx-auto px-4 py-8">
        <InteractiveMenu items={items} brandColor={expData.brand_color} />
      </div>

      {expData.vibe_videos && expData.vibe_videos.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 py-12 border-t border-white/10">
          <h3 className="text-xl font-extrabold text-white mb-6 uppercase tracking-wider flex items-center gap-2">
            <span>🔥</span> L'Atmosfera del Locale
          </h3>
          <VibeGrid videos={expData.vibe_videos} />
        </section>
      )}

      <footer className="border-t border-white/10 py-10 text-center text-xs text-gray-500">
        <p className="font-bold text-gray-400">{expData.nome_ristorante}</p>
        {expData.address && <p className="mt-1">{expData.address}</p>}
        <p className="mt-4 text-[10px] text-gray-600">Powered by RM Studio Experience Engine</p>
      </footer>

      {expData.nexus_bot_id && (
        <NexusWidget botId={expData.nexus_bot_id} brandColor={expData.brand_color} />
      )}
    </main>
  );
}
