/**
 * Experience Engine - Stripe On-The-Fly Checkout
 * RM Studio Universal Engine
 */
export async function avviaCheckoutExperience(
  slug: string = "nuovo_ristorante",
  nomeRistorante: string = "Nuovo Ristorante",
  ownerEmail?: string
) {
  const origin = typeof window !== "undefined" ? window.location.origin : "https://experience.rmstudio.app";

  const payload = {
    progetto: "Experience",
    portal_type: "experience",
    title: `Sblocco Smart Menu • ${nomeRistorante}`,
    price: 390,
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

    if (!res.ok) throw new Error("Errore creazione sessione Stripe");
    const data = await res.json();
    const redirectUrl = data.url || data.checkout_url || data.session_url;

    if (redirectUrl) {
      window.location.href = redirectUrl;
    } else {
      throw new Error("URL Stripe mancante");
    }
  } catch (err) {
    console.error("Errore checkout Experience:", err);
    alert("Impossibile avviare il pagamento. Riprova tra poco.");
  }
}
