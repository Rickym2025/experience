import { supabase } from '@/lib/supabase';
import { TasteExperience, MenuItem } from '@/types/experience';
import HeroExperience from '@/components/HeroExperience';
import InteractiveMenu from '@/components/InteractiveMenu';
import VibeGrid from '@/components/VibeGrid';
import NexusWidget from '@/components/NexusWidget';
import UnlockBanner from '@/components/UnlockBanner';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 60;

export default async function ExperiencePage({ params }: PageProps) {
  const { slug } = await params;

  const { data: experience } = await supabase
    .from('taste_experiences')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (!experience) {
    return (
      <div className="min-h-screen bg-[#050508] text-white flex items-center justify-center font-sans">
        <p className="text-sm font-bold">Ristorante non trovato.</p>
      </div>
    );
  }

  const { data: menuItems } = await supabase
    .from('taste_menus')
    .select('*')
    .eq('experience_slug', slug)
    .order('categoria', { ascending: true });

  const expData = experience as TasteExperience & {
    font_style?: string;
    bg_style?: string;
  };
  const items = (menuItems || []) as MenuItem[];

  const fontClass =
    expData.font_style === 'serif'
      ? 'font-serif'
      : expData.font_style === 'mono'
      ? 'font-mono'
      : 'font-sans';

  const bgClass =
    expData.bg_style === 'cream'
      ? 'bg-[#faf8f5] text-stone-900'
      : expData.bg_style === 'light'
      ? 'bg-white text-gray-900'
      : 'bg-[#050508] text-gray-100';

  return (
    <main className={`min-h-screen ${bgClass} ${fontClass} selection:bg-amber-500 selection:text-black pb-24`}>
      <HeroExperience experience={expData} />

      <div className="max-w-5xl mx-auto px-4 py-8">
        <InteractiveMenu items={items} brandColor={expData.brand_color} />
      </div>

      {expData.vibe_videos && expData.vibe_videos.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 py-12 border-t border-current/10">
          <h3 className="text-xl font-extrabold mb-6 uppercase tracking-wider flex items-center gap-2">
            <span>🔥</span> L&apos;Atmosfera del Locale
          </h3>
          <VibeGrid videos={expData.vibe_videos} />
        </section>
      )}

      <footer className="border-t border-current/10 py-10 text-center text-xs opacity-60">
        <p className="font-bold">{expData.nome_ristorante}</p>
        {expData.address && <p className="mt-1">{expData.address}</p>}
        <p className="mt-4 text-[10px] opacity-50">Powered by RM Studio Experience Engine</p>
      </footer>

      {expData.nexus_bot_id && (
        <NexusWidget
          botId={expData.nexus_bot_id}
          brandColor={expData.brand_color}
          nomeRistorante={expData.nome_ristorante}
          logoUrl={expData.logo_url}
          ownerName={expData.owner_name}
        />
      )}

      {/* Banner Sblocco On-The-Fly */}
      <UnlockBanner
        slug={expData.slug}
        nomeRistorante={expData.nome_ristorante}
        ownerEmail={expData.owner_email}
        isPaid={expData.is_paid}
      />
    </main>
  );
}
