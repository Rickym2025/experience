import { supabase } from '@/lib/supabase';
import { TasteExperience, MenuItem } from '@/types/experience';
import HeroExperience from '@/components/HeroExperience';
import InteractiveMenu from '@/components/InteractiveMenu';
import VibeGrid from '@/components/VibeGrid';
import NexusWidget from '@/components/NexusWidget';
import UnlockBanner from '@/components/UnlockBanner';
import PrivilegeClubModal from '@/components/PrivilegeClubModal';

// DISATTIVAZIONE TOTALE DELLA CACHE: DATI LIVE DA SUPABASE AD OGNI VISITA
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ExperiencePage({ params }: PageProps) {
  const { slug } = await params;

  // 1. Recupero Dati Principali Ristorante da Supabase S1 (taste_experiences)
  const { data: experience } = await supabase
    .from('taste_experiences')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (!experience) {
    return (
      <div className="min-h-screen bg-[#050508] text-white flex items-center justify-center font-sans">
        <p className="text-sm font-bold">Ristorante o Tenuta non trovata.</p>
      </div>
    );
  }

  // 2. Recupero Portate e Carta dei Vini Reali da Supabase S1 (taste_menus)
  const { data: menuItems } = await supabase
    .from('taste_menus')
    .select('*')
    .eq('experience_slug', slug)
    .order('categoria', { ascending: true });

  // 3. Verifica Condizionale: Esistono video 3D in Locanda Digitale per questo ristorante?
  let hasLocanda3D = false;
  try {
    const locandaCheck = await fetch(
      `https://nnuhzrzoebudwyalevht.supabase.co/rest/v1/locanda_piatti?restaurant_slug=eq.${encodeURIComponent(slug)}&select=id&limit=1`,
      {
        headers: {
          apikey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5udWh6cnpvZWJ1ZHd5YWxldmh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgzMzUxMTMsImV4cCI6MjEwMzkxMTExM30.oYADAYynRXyQrfnTMgYUeXpIyML4YnS0VQp3y8HIdGU',
          Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5udWh6cnpvZWJ1ZHd5YWxldmh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgzMzUxMTMsImV4cCI6MjEwMzkxMTExM30.oYADAYynRXyQrfnTMgYUeXpIyML4YnS0VQp3y8HIdGU'
        },
        cache: 'no-store'
      }
    );
    if (locandaCheck.ok) {
      const data = await locandaCheck.json();
      hasLocanda3D = Array.isArray(data) && data.length > 0;
    }
  } catch {
    hasLocanda3D = false;
  }

  const expData = experience as TasteExperience & {
    font_style?: string;
    bg_style?: string;
    google_maps_url?: string;
    phone_number?: string;
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
    <main className={`min-h-screen ${bgClass} ${fontClass} selection:bg-amber-500 selection:text-black pb-24 relative`}>
      {/* Hero Multimediale con Immagine d'Atmosfera */}
      <HeroExperience experience={expData} />

      {/* 🎬 COLLEGAMENTO CONDIZIONALE A LOCANDA DIGITALE (SOLO SE ESISTONO VIDEO 3D) */}
      {hasLocanda3D && (
        <section className="max-w-5xl mx-auto px-4 -mt-4 mb-6 relative z-20">
          <a
            href={`https://locandadigitale.rmstudio.app/menu.html?slug=${expData.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500/20 via-amber-500/30 to-amber-500/20 hover:from-amber-500/30 hover:to-amber-500/30 border border-amber-500/50 text-amber-300 font-extrabold text-sm flex items-center justify-between shadow-xl transition-all group backdrop-blur-md"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl animate-pulse">🎬</span>
              <div>
                <span className="font-bold text-white block">Living 3D Menu Attivo al Tavolo</span>
                <span className="text-xs text-amber-200/80 font-normal">Guarda i piatti in video a 60 FPS e invia le comande su WhatsApp</span>
              </div>
            </div>
            <span className="px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 text-xs font-black uppercase tracking-wider group-hover:scale-105 transition-transform shadow">
              Guarda il video del piatto ➔
            </span>
          </a>
        </section>
      )}

      {/* Menu e Carta dei Vini Interattiva con Abbinamenti Sommelier */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        <InteractiveMenu items={items} brandColor={expData.brand_color} />
      </div>

      {/* Vibe Video dell'Atmosfera in Sala e Cantina */}
      {expData.vibe_videos && expData.vibe_videos.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 py-12 border-t border-current/10">
          <h3 className="text-xl font-extrabold mb-6 uppercase tracking-wider flex items-center gap-2">
            <span>🔥</span> L&apos;Atmosfera del Locale
          </h3>
          <VibeGrid videos={expData.vibe_videos} />
        </section>
      )}

      {/* Footer Locale White-Label con Accesso Riservato Gestione */}
      <footer className="border-t border-current/10 py-10 text-center text-xs opacity-60">
        <p className="font-bold">{expData.nome_ristorante}</p>
        {expData.address && <p className="mt-1">{expData.address}</p>}
        
        <div className="mt-4 flex items-center justify-center gap-4 text-[11px] opacity-75">
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

      {/* Maître Virtuale & Sommelier AI Nexus */}
      {expData.nexus_bot_id && (
        <NexusWidget
          botId={expData.nexus_bot_id}
          brandColor={expData.brand_color}
          nomeRistorante={expData.nome_ristorante}
          logoUrl={expData.logo_url}
          ownerName={expData.owner_name}
        />
      )}

      {/* Circolo Privato & Omaggio del Sommelier + Scudo Recensioni */}
      <PrivilegeClubModal
        slug={expData.slug}
        nomeRistorante={expData.nome_ristorante}
        googleMapsUrl={expData.google_maps_url}
        ownerPhone={expData.phone_number}
        brandColor={expData.brand_color}
      />

      {/* Banner Sblocco On-The-Fly per Proposta Commerciale */}
      <UnlockBanner
        slug={expData.slug}
        nomeRistorante={expData.nome_ristorante}
        ownerEmail={expData.owner_email}
        isPaid={expData.is_paid}
      />
    </main>
  );
}
