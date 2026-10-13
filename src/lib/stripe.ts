/**
 * Experience Engine - Live Dynamic Pricing Engine (Supabase S2) & Stripe Checkout
 * RM Studio Universal Engine
 */
const SUPABASE_S2_URL = "https://jhijfulhntlhcytbhcly.supabase.co";
const SUPABASE_S2_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoaWpmdWxobnRsaGN5dGJoY2x5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI3MzcxODcsImV4cCI6MjA5ODMxMzE4N30.z062NW4ApClll-XWHH2ufmcCleBRNHUUdKO6FiLa0TQ";

export interface ExperiencePrices {
  basePrice: number;    // Piano Base: Sblocco Portale Smart Menu
  musicPrice: number;   // Add-On Opzionale: Brano Inedito SIAE (FF Edizioni)
}

// Retrocompatibilità per interfacce esistenti
export interface ExperiencePricingData {
  price: number;
  name: string;
}

// ⚡ Recupera entrambi i prezzi (base + musica) dal database centrale S2
export async function getLivePricesExperience(): Promise<ExperiencePrices> {
  const defaults: ExperiencePrices = {
    basePrice: 390,
    musicPrice: 250
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
          if (item.plan_id === 'sblocco' && item.price !== undefined) {
            defaults.basePrice = Number(item.price);
          }
          if (item.plan_id === 'brano' && item.price !== undefined) {
            defaults.musicPrice = Number(item.price);
          }
        });
      }
    }
  } catch (e) {
    console.warn("Utilizzo prezzi fallback per Experience:", e);
  }
  return defaults;
}

// ⚡ Export retrocompatibile al singolare (usato da UnlockBanner.tsx)
export async function getLivePriceExperience(fallbackPrice: number = 390): Promise<number> {
  const prices = await getLivePricesExperience();
  return prices.basePrice || fallbackPrice;
}

// ⚡ Checkout flessibile: supporta sia le chiamate da UnlockBanner sia quelle con il brano opzionale da LandingPricing
export async function avviaCheckoutExperience(
  slug: string = "nuovo_ristorante",
  nomeRistorante: string = "Nuovo Ristorante",
  includeMusicOrEmail?: boolean | string,
  ownerEmailOrPrice?: string | number,
  priceOverride?: number
): Promise<void> {
  const origin = typeof window !== "undefined" ? window.location.origin : "https://experience.rmstudio.app";
  const livePrices = await getLivePricesExperience();

  let includeMusic = false;
  let ownerEmail: string | undefined = undefined;
  let finalPrice: number = livePrices.basePrice;

  // Gestione parametri polimorfica per supportare sia la vecchia che la nuova firma
  if (typeof includeMusicOrEmail === "string") {
    // Chiamata vecchio stile: (slug, nome, ownerEmail, priceOverride)
    ownerEmail = includeMusicOrEmail;
    includeMusic = false;
    finalPrice = typeof ownerEmailOrPrice === "number" ? ownerEmailOrPrice : livePrices.basePrice;
  } else {
    // Chiamata nuovo stile con add-on musica: (slug, nome, includeMusic, ownerEmail, priceOverride)
    includeMusic = Boolean(includeMusicOrEmail);
    ownerEmail = typeof ownerEmailOrPrice === "string" ? ownerEmailOrPrice : undefined;
    finalPrice = priceOverride !== undefined 
      ? priceOverride 
      : (livePrices.basePrice + (includeMusic ? livePrices.musicPrice : 0));
  }

  const planType = includeMusic ? "sblocco_con_brano" : "sblocco";
  const planTitle = includeMusic
    ? `Smart Menu + Colonna Sonora d'Autore SIAE • ${nomeRistorante}`
    : `Sblocco Smart Menu & Storytelling • ${nomeRistorante}`;

  const payload = {
    progetto: "Experience",
    portal_type: "experience",
    title: planTitle,
    price: finalPrice,
    ricarica_tipo: planType,
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
