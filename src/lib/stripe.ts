/**
 * Experience Engine - Live Dynamic Pricing Engine (Supabase S2) & Stripe Checkout
 * RM Studio Universal Engine
 */
const SUPABASE_S2_URL = "https://jhijfulhntlhcytbhcly.supabase.co";
const SUPABASE_S2_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoaWpmdWxobnRsaGN5dGJoY2x5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI3MzcxODcsImV4cCI6MjA5ODMxMzE4N30.z062NW4ApClll-XWHH2ufmcCleBRNHUUdKO6FiLa0TQ";

export interface ExperienceTierPrices {
  starter: number; // Tier 1: Carta Base
  pro: number;     // Tier 2: Signature Experience (Il più conveniente)
  royal: number;   // Tier 3: Royal + Colonna Sonora SIAE FF Edizioni
  musicAddon: number; // Brano singolo SIAE
}

// ⚡ Recupera i 3 prezzi aggiornati in tempo reale da Supabase S2 (saas_pricing)
export async function getLiveTiersExperience(): Promise<ExperienceTierPrices> {
  const defaults: ExperienceTierPrices = {
    starter: 190,
    pro: 390,
    royal: 690,
    musicAddon: 300
  };

  try {
    const res = await fetch(
      `${SUPABASE_S2_URL}/rest/v1/saas_pricing?saas=eq.experience&select=plan_id,price`,
      {
        headers: {
          apikey: SUPABASE_S2_KEY,
          Authorization: `Bearer ${SUPABASE_S2_KEY}`
        },
        cache: 'no-store'
      }
    );

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        data.forEach((item: { plan_id: string; price: number }) => {
          if (item.plan_id === 'starter' && item.price !== undefined) defaults.starter = Number(item.price);
          if ((item.plan_id === 'sblocco' || item.plan_id === 'pro') && item.price !== undefined) defaults.pro = Number(item.price);
          if (item.plan_id === 'royal' && item.price !== undefined) defaults.royal = Number(item.price);
          if (item.plan_id === 'brano' && item.price !== undefined) defaults.musicAddon = Number(item.price);
        });
      }
    }
  } catch (e) {
    console.warn("Utilizzo prezzi fallback Experience:", e);
  }
  return defaults;
}

// Retrocompatibilità per UnlockBanner.tsx
export async function getLivePriceExperience(fallbackPrice: number = 390): Promise<number> {
  const tiers = await getLiveTiersExperience();
  return tiers.pro || fallbackPrice;
}

// Checkout universale on-the-fly per n8n Stripe
export async function avviaCheckoutTierExperience(
  planId: 'starter' | 'pro' | 'royal',
  slug: string = "nuovo_ristorante",
  nomeRistorante: string = "Nuovo Ristorante",
  ownerEmail?: string,
  priceOverride?: number
): Promise<void> {
  const origin = typeof window !== "undefined" ? window.location.origin : "https://experience.rmstudio.app";
  const SUPERADMIN_EMAILS = [
    "modena.riccardo@gmail.com",
    "riccardo@rmstudio.app",
    "info@rmstudio.app"
  ];

  if (ownerEmail && SUPERADMIN_EMAILS.includes(ownerEmail.toLowerCase().trim())) {
    console.log("👑 SuperAdmin Riccardo Modena — Bypass Stripe attivo");
    window.location.href = `${origin}/${slug}?success=true&admin_bypass=true`;
    return;
  }
  const liveTiers = await getLiveTiersExperience();

  let finalPrice = priceOverride !== undefined ? priceOverride : liveTiers.pro;
  let planTitle = `Signature Experience • ${nomeRistorante}`;

  if (planId === 'starter') {
    finalPrice = priceOverride !== undefined ? priceOverride : liveTiers.starter;
    planTitle = `Carta Digitale Smart • ${nomeRistorante}`;
  } else if (planId === 'royal') {
    finalPrice = priceOverride !== undefined ? priceOverride : liveTiers.royal;
    planTitle = `Royal Experience & Sound Identity SIAE • ${nomeRistorante}`;
  }

  const payload = {
    progetto: "Experience",
    portal_type: "experience",
    title: planTitle,
    price: finalPrice,
    ricarica_tipo: planId,
    email: ownerEmail || undefined,
    agency_id: slug,
    project_id: slug,
    origin: origin,
    success_url: `${origin}/${slug}?success=true`,
    cancel_url: `${origin}/#pricing`
  };

  try {
    const res = await fetch("https://n8n.rmstudio.app/webhook/crea-sessione-stripe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data: { url?: string; checkout_url?: string; session_url?: string } = await res.json();
    const redirectUrl = data.url || data.checkout_url || data.session_url;

    if (redirectUrl) {
      window.location.href = redirectUrl;
    } else {
      throw new Error("URL Stripe mancante nella risposta di n8n");
    }
  } catch (err) {
    console.error("Errore checkout Experience:", err);
    alert("Impossibile avviare il pagamento. Riprova tra poco.");
  }
}

// Retrocompatibilità per UnlockBanner.tsx legacy call
export async function avviaCheckoutExperience(
  slug: string = "nuovo_ristorante",
  nomeRistorante: string = "Nuovo Ristorante",
  ownerEmail?: string,
  priceOverride?: number
): Promise<void> {
  return avviaCheckoutTierExperience('pro', slug, nomeRistorante, ownerEmail, priceOverride);
}
