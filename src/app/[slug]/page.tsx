import { supabase } from '@/lib/supabase';
import { TasteExperience, MenuItem } from '@/types/experience';
import HeroExperience from '@/components/HeroExperience';
import InteractiveMenu from '@/components/InteractiveMenu';
import VibeGrid from '@/components/VibeGrid';
import NexusWidget from '@/components/NexusWidget';
import UnlockBanner from '@/components/UnlockBanner';
import PrivilegeClubModal from '@/components/PrivilegeClubModal';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ExperiencePage({ params }: PageProps) {
  const { slug } = await params;

  // 1. Recupero dati ristorante: prova prima 'taste_experience' poi 'taste_experiences'
  let experienceData: any = null;
  const { data: dSingle } = await supabase
    .from('taste_experience')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle();

  if (dSingle) {
    experienceData = dSingle;
  } else {
    const { data: dPlural } = await supabase
      .from('taste_experiences')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .maybeSingle();
    experienceData = dPlural;
  }

  if (!experienceData) {
    return (
      <div className="min-h-screen bg-[#050508] text-white flex items-center justify-center font-sans">
        <p className="text-sm font-bold">Ristorante o Tenuta non trovata.</p>
      </div>
    );
  }

  // 2. Recupero Portate e Carta Vini da taste_menus (o taste_menu)
  let menuItems: MenuItem[] = [];
  const { data: mPlural } = await supabase
    .from('taste_menus')
    .select('*')
    .eq('experience_slug', slug)
    .order('categoria', { ascending: true });

  if (mPlural && mPlural.length > 0) {
    menuItems = mPlural as MenuItem[];
  } else {
    const { data: mSingle } = await supabase
      .from('taste_menu')
      .select('*')
      .eq('experience_slug', slug)
      .order('categoria', { ascending: true });
    if (mSingle) menuItems = mSingle as MenuItem[];
  }

  const expData = experienceData as TasteExperience & {
    font_style?: string;
    bg_style?: string;
    google_maps_url?: string;
    phone_number?: string;
  };

  const fontClass =
    expData.font_style === 'serif'
      ? 'font-serif'
      : expData.font_style === 'mono'
      ? 'font-mono'
      : 'font-sans';

  // Immagine dinamica presa da Supabase (copertina del ristorante specifico)
  const bgCoverUrl = expData.cover_image;

  return (
    <main className={`min-h-screen ${fontClass} text-zinc-100 selection:bg-amber-500 selection:text-black pb-28 relative overflow-x-hidden bg-[#07080f]`}>
      
      {/* ─── 1. SFONDO DINAMICO DEL RISTORANTE (VISIBILE IN TUTTO IL MENU) ─── */}
      {bgCoverUrl && (
        <div 
          className="fixed inset-0 z-0 pointer-events-none bg-cover bg-center opacity-40 scale-105 transition-all duration-1000"
          style={{ backgroundImage: `url('${bgCoverUrl}')` }}
        />
      )}

      {/* ─── 2. GRADIENTI E LUCI D'ATMOSFERA GOURMET ─── */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-gradient-to-b from-black/50 via-[#070810]/75 to-[#040508]/90" />
      <div className="fixed top-1/4 right-0 w-[550px] h-[550px] bg-amber-500/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed bottom-1/3 left-0 w-[500px] h-[500px] bg-rose-600/15 rounded-full blur-[150px] pointer-events-none" />

      {/* ─── 3. CONTENUTO DELLA PAGINA ─── */}
      <div className="relative z-10">
        {/* Hero Multimediale */}
        <HeroExperience experience={expData} />

        {/* Menu Interattivo con Video 3D Integrati e Carrello al Tavolo */}
        <div className="max-w-5xl mx-auto px-4 py-8">
          <InteractiveMenu 
            items={menuItems} 
            brandColor={expData.brand_color || '#d97706'} 
            slug={expData.slug}
            restaurantPhone={expData.phone_number}
          />
        </div>

        {/* Vibe Video dell'Atmosfera in Sala e Cantina */}
        {expData.vibe_videos && expData.vibe_videos.length > 0 && (
          <section className="max-w-5xl mx-auto px-4 py-12 border-t border-white/10">
            <h3 className="text-xl font-extrabold mb-6 uppercase tracking-wider flex items-center gap-2">
              <span>🔥</span> L&apos;Atmosfera del Locale
            </h3>
            <VibeGrid videos={expData.vibe_videos} />
          </section>
        )}

        {/* Footer Locale con Accesso Riservato Gestione */}
        <footer className="border-t border-white/10 py-10 text-center text-xs opacity-75 backdrop-blur-md">
          <p className="font-bold text-white text-sm">{expData.nome_ristorante}</p>
          {expData.address && <p className="mt-1 text-zinc-400">{expData.address}</p>}
          
          <div className="mt-4 flex items-center justify-center gap-4 text-[11px] text-zinc-400">
            <p>Powered by RM Studio Experience Engine</p>
            <span>•</span>
            <a
              href={`/${expData.slug}/gestione`}
              className="hover:underline text-amber-400 font-bold transition-colors"
              title="Area riservata per modificare, aggiungere o eliminare piatti"
            >
              ✏️ Modifica Menu
            </a>
          </div>
        </footer>
      </div>

      {/* Maître Virtuale & Sommelier AI (con Logo Supabase e posizionato sopra la riserva) */}
      <NexusWidget
        botId={expData.nexus_bot_id || expData.slug}
        restaurantSlug={expData.slug}
        brandColor={expData.brand_color || '#d97706'}
        nomeRistorante={expData.nome_ristorante}
        logoUrl={expData.logo_url}
        ownerName={expData.owner_name}
      />

      {/* Circolo Privato & Omaggio del Sommelier */}
      <PrivilegeClubModal
        slug={expData.slug}
        nomeRistorante={expData.nome_ristorante}
        googleMapsUrl={expData.google_maps_url}
        ownerPhone={expData.phone_number}
        brandColor={expData.brand_color || '#d97706'}
      />

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
