/**
 * Experience Engine - Live Pricing & Stripe On-The-Fly Checkout
 * RM Studio Universal Engine
 */
const SUPABASE_S2_URL = "https://jhijfulhntlhcytbhcly.supabase.co";
const SUPABASE_S2_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoaWpmdWxobnRsaGN5dGJoY2x5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI3MzcxODcsImV4cCI6MjA5ODMxMzE4N30.z062NW4ApClll-XWHH2ufmcCleBRNHUUdKO6FiLa0TQ";

export interface ExperiencePricingData {
  price: number;
  name: string;
}

// ⚡ Recupera il prezzo aggiornato in tempo reale da saas_pricing
export async function getLivePriceExperience(fallbackPrice: number = 390): Promise<number> {
  try {
    const res = await fetch(
      `${SUPABASE_S2_URL}/rest/v1/saas_pricing?saas=eq.experience&plan_id=eq.sblocco&select=price,name`,
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
      if (Array.isArray(data) && data.length > 0 && data[0].price !== undefined) {
        return Number(data[0].price);
      }
    }
  } catch (e) {
    console.warn("Utilizzo fallback price Experience:", e);
  }
  return fallbackPrice;
}

export async function avviaCheckoutExperience(
  slug: string = "nuovo_ristorante",
  nomeRistorante: string = "Nuovo Ristorante",
  ownerEmail?: string,
  priceOverride?: number
): Promise<void> {
  const origin = typeof window !== "undefined" ? window.location.origin : "https://experience.rmstudio.app";
  
  // Se non passato, preleva il prezzo live dal database centrale S2
  const finalPrice = priceOverride !== undefined ? priceOverride : await getLivePriceExperience(390);

  const payload = {
    progetto: "Experience",
    portal_type: "experience",
    title: `Sblocco Smart Menu • ${nomeRistorante}`,
    price: finalPrice,
    ricarica_tipo: "sblocco",
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
