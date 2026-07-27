import { supabase } from '@/lib/supabase';
import { TasteExperience, MenuItem } from '@/types/experience';
import { notFound } from 'next/navigation';
import HeroExperience from '@/components/HeroExperience';
import InteractiveMenu from '@/components/InteractiveMenu';
import VibeGrid from '@/components/VibeGrid';
import NexusWidget from '@/components/NexusWidget';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 60; // Cache ISR 60 secondi per massima velocità

export default async function ExperiencePage({ params }: PageProps) {
  const { slug } = await params;

  // 1. Recupera i dati del Ristorante
  const { data: experience, error: expError } = await supabase
    .from('taste_experiences')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (expError || !experience) {
    notFound();
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
      {/* 1. HERO CON SELETTORE ATMOSFERA */}
      <HeroExperience experience={expData} />

      {/* 2. MENU INTERATTIVO E FILTRABILE AI */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        <InteractiveMenu items={items} brandColor={expData.brand_color} />
      </div>

      {/* 3. SOCIAL VIBE GRID (REELS) */}
      {expData.vibe_videos && expData.vibe_videos.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 py-12 border-t border-white/10">
          <h3 className="text-xl font-extrabold text-white mb-6 uppercase tracking-wider flex items-center gap-2">
            <span>🔥</span> L'Atmosfera del Locale
          </h3>
          <VibeGrid videos={expData.vibe_videos} />
        </section>
      )}

      {/* 4. FOOTER CON PRENOTAZIONE RAPIDA */}
      <footer className="border-t border-white/10 py-10 text-center text-xs text-gray-500">
        <p className="font-bold text-gray-400">{expData.nome_ristorante}</p>
        {expData.address && <p className="mt-1">{expData.address}</p>}
        <p className="mt-4 text-[10px] text-gray-600">Powered by RM Studio Experience Engine</p>
      </footer>

      {/* 5. CHATBOT NEXUS INTEGRATO */}
      {expData.nexus_bot_id && (
        <NexusWidget botId={expData.nexus_bot_id} brandColor={expData.brand_color} />
      )}
    </main>
  );
}
