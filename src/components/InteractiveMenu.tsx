'use client';

import React, { useState, useEffect } from 'react';
import { MenuItem } from '@/types/experience';
import { Wine, Sparkles, ShoppingBag, Send, X, ChefHat, Check } from 'lucide-react';

interface MenuProps {
  items: MenuItem[];
  brandColor: string;
}

interface CartItem {
  dish: MenuItem;
  qty: number;
}

const safeArray = (data: any): string[] => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (typeof data === 'string') {
    try {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {
      return data.split(',').map((s) => s.trim()).filter(Boolean);
    }
  }
  return [];
};

export default function InteractiveMenu({ items, brandColor }: MenuProps) {
  const [selectedMood, setSelectedMood] = useState<string>('tutti');
  const [selectedCategory, setSelectedCategory] = useState<string>('tutti');
  const [activeModalItem, setActiveModalItem] = useState<MenuItem | null>(null);

  // Mappa dei video 3D recuperati in tempo reale da Locanda Digitale
  const [locandaVideos, setLocandaVideos] = useState<Record<string, string>>({});
  const [activeModalVideoUrl, setActiveModalVideoUrl] = useState<string | null>(null);

  // Carrello per comanda al tavolo integrata
  const [cart, setCart] = useState<Record<string, CartItem>>({});
  const [isOrderModalOpen, setIsOrderModalOpen] = useState<boolean>(false);
  const [tableNumber, setTableNumber] = useState<string>('Tavolo');
  const [orderNotes, setOrderNotes] = useState<string>('');

  // Estrae lo slug dall'URL corrente (es. /ristorante-m4 ➔ ristorante-m4)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const pathSegments = window.location.pathname.split('/').filter(Boolean);
      const slug = pathSegments[0] || 'ristorante-m4';

      // Interroga Supabase di Locanda Digitale per trovare i video 3D associati
      fetch(
        `https://nnuhzrzoebudwyalevht.supabase.co/rest/v1/locanda_piatti?restaurant_slug=eq.${encodeURIComponent(slug)}&select=nome_piatto,video_url&is_active=eq.true`,
        {
          headers: {
            apikey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5udWh6cnpvZWJ1ZHd5YWxldmh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgzMzUxMTMsImV4cCI6MjEwMzkxMTExM30.oYADAYynRXyQrfnTMgYUeXpIyML4YnS0VQp3y8HIdGU',
            Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5udWh6cnpvZWJ1ZHd5YWxldmh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgzMzUxMTMsImV4cCI6MjEwMzkxMTExM30.oYADAYynRXyQrfnTMgYUeXpIyML4YnS0VQp3y8HIdGU'
          },
          cache: 'no-store'
        }
      )
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            const map: Record<string, string> = {};
            data.forEach((d: any) => {
              if (d.nome_piatto && d.video_url) {
                map[d.nome_piatto.toLowerCase().trim()] = d.video_url;
              }
            });
            setLocandaVideos(map);
          }
        })
        .catch(() => {});
    }
  }, []);

  const categories = ['tutti', ...Array.from(new Set(items.map((i) => i.categoria)))];

  const filteredItems = items.filter((item) => {
    const matchCategory = selectedCategory === 'tutti' || item.categoria === selectedCategory;
    const itemOccasioni = safeArray(item.occasioni);
    const matchMood =
      selectedMood === 'tutti' ||
      itemOccasioni.includes(selectedMood);
    return matchCategory && matchMood;
  });

  // Gestione Carrello
  const updateCart = (dish: MenuItem, change: number) => {
    setCart(prev => {
      const next = { ...prev };
      const currentQty = next[dish.id]?.qty || 0;
      const newQty = currentQty + change;

      if (newQty <= 0) {
        delete next[dish.id];
      } else {
        next[dish.id] = { dish, qty: newQty };
      }
      return next;
    });
  };

  const cartItemsArray = Object.values(cart);
  const totalCartCount = cartItemsArray.reduce((acc, curr) => acc + curr.qty, 0);
  const totalCartPrice = cartItemsArray.reduce((acc, curr) => acc + (curr.qty * Number(curr.dish.prezzo || 0)), 0);

  const handleOpenModal = (item: MenuItem) => {
    setActiveModalItem(item);
    const key = item.nome_piatto.toLowerCase().trim();
    setActiveModalVideoUrl(locandaVideos[key] || item.foto_url || null);
  };

  const handleSendOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const table = tableNumber.trim() || 'Tavolo';
    
    let text = `🧾 *NUOVA COMANDA — ${table.toUpperCase()}*\n━━━━━━━━━━━━━━━━━━━━\n`;
    cartItemsArray.forEach(item => {
      const sub = item.qty * Number(item.dish.prezzo || 0);
      text += `• *${item.qty}x* ${item.dish.nome_piatto} (€${sub.toFixed(2)})\n`;
    });
    text += `━━━━━━━━━━━━━━━━━━━━\n💰 *TOTALE: €${totalCartPrice.toFixed(2)}*\n`;
    if (orderNotes.trim()) text += `📝 *Note:* ${orderNotes.trim()}\n`;

    const cleanPhone = '393495258418'; // Sostituibile con il numero del locale
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`, '_blank');
    setIsOrderModalOpen(false);
  };

  return (
    <div className="w-full pb-32">
      {/* SELETTORE MOOD / ESPERIENZA */}
      <div className="bg-[#0b0b12] border border-white/10 rounded-3xl p-5 mb-8 shadow-2xl backdrop-blur-xl">
        <label className="block text-xs font-black uppercase tracking-widest text-amber-400 mb-3 text-center font-mono">
          ✨ Che esperienza cerchi stasera?
        </label>
        <div className="flex flex-wrap justify-center gap-2.5">
          {[
            { id: 'tutti', label: '🍽️ Tutti i Piatti' },
            { id: 'romantica', label: '🕯️ Cena Romantica' },
            { id: 'pesce', label: '🐟 Specialità Pesce' },
            { id: 'veloce', label: '⚡ Pranzo Veloce' },
            { id: 'gruppo', label: '🍷 In Compagnia' },
          ].map((mood) => (
            <button
              key={mood.id}
              onClick={() => setSelectedMood(mood.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedMood === mood.id
                  ? 'text-black font-black shadow-lg scale-105'
                  : 'bg-white/5 text-gray-200 hover:bg-white/10 border border-white/10'
              }`}
              style={{
                backgroundColor: selectedMood === mood.id ? brandColor : undefined,
              }}
            >
              {mood.label}
            </button>
          ))}
        </div>
      </div>

      {/* FILTRO CATEGORIE */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none justify-center">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-5 py-2 rounded-full text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all border cursor-pointer ${
              selectedCategory === cat
                ? 'bg-white text-black border-white shadow-lg scale-105'
                : 'bg-[#12121c] text-gray-300 border-white/10 hover:border-white/30 hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* LISTA PIATTI CARD LUXURY */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-12 text-gray-400 text-sm font-semibold">
          Nessun piatto trovato per i filtri selezionati.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredItems.map((item) => {
            const allergeniList = safeArray(item.allergeni);
            const keyName = item.nome_piatto.toLowerCase().trim();
            const hasVideo3D = !!locandaVideos[keyName];
            const itemQty = cart[item.id]?.qty || 0;

            return (
              <div
                key={item.id}
                className="bg-[#0c0c14] border border-white/10 hover:border-white/25 rounded-3xl p-5 transition-all flex flex-col justify-between group shadow-xl relative overflow-hidden"
              >
                {/* Badge Video 3D Immersivo */}
                {hasVideo3D && (
                  <div className="absolute top-4 right-4 px-2.5 py-1 rounded-full bg-purple-500/25 border border-purple-500/50 text-purple-300 text-[10px] font-black uppercase tracking-widest flex items-center gap-1 shadow">
                    <Sparkles size={11} /> Video 3D
                  </div>
                )}

                <div>
                  <div className="flex justify-between items-start gap-3 mb-2 pr-16">
                    <h4 className="font-black text-white text-lg group-hover:text-amber-400 transition">
                      {item.nome_piatto}
                    </h4>
                    <span className="font-black text-base px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0 font-mono">
                      €{Number(item.prezzo).toFixed(2)}
                    </span>
                  </div>

                  {item.descrizione && (
                    <p className="text-xs text-gray-300 leading-relaxed line-clamp-3 mb-4 font-normal">
                      {item.descrizione}
                    </p>
                  )}

                  {/* Wine Pairing Badge */}
                  {item.pairing_vino && (
                    <div className="inline-flex items-center gap-2 text-xs text-purple-200 bg-purple-500/10 border border-purple-500/20 px-3.5 py-1.5 rounded-xl mb-4">
                      <Wine size={14} className="text-purple-400 shrink-0" />
                      <span>Sommelier AI: <strong className="font-extrabold">{item.pairing_vino}</strong></span>
                    </div>
                  )}
                </div>

                {/* Footer Card: Allergeni, Storytelling e Comanda Rapida */}
                <div className="pt-3 border-t border-white/5 flex justify-between items-center gap-2">
                  <div className="flex flex-wrap gap-1">
                    {allergeniList.map((all, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] uppercase font-bold text-gray-400 bg-white/5 border border-white/5 px-2 py-0.5 rounded-md"
                      >
                        {all}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <button
                      onClick={() => handleOpenModal(item)}
                      className="text-xs font-extrabold text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>📖 Story &amp; Video</span>
                    </button>

                    <div className="flex items-center gap-1 bg-black/80 border border-white/15 rounded-xl p-0.5">
                      <button
                        onClick={() => updateCart(item, -1)}
                        className="w-7 h-7 rounded-lg bg-white/10 text-white font-bold flex items-center justify-center active:scale-90 cursor-pointer text-xs"
                      >
                        -
                      </button>
                      <span className="text-xs font-mono font-black text-white px-1.5">{itemQty}</span>
                      <button
                        onClick={() => updateCart(item, 1)}
                        className="w-7 h-7 rounded-lg text-black font-black flex items-center justify-center active:scale-90 cursor-pointer text-xs"
                        style={{ backgroundColor: brandColor }}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── MODALE STORYTELLING & VIDEO 3D INTEGRATO ─── */}
      {activeModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in">
          <div className="bg-[#10101a] border border-white/20 rounded-3xl max-w-md w-full p-6 relative shadow-2xl max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setActiveModalItem(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white font-bold text-xl cursor-pointer z-10 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center"
            >
              <X size={18} />
            </button>

            <span className="text-xs uppercase font-black tracking-widest text-amber-400 block mb-1 font-mono">
              {activeModalItem.categoria}
            </span>
            <div className="flex justify-between items-baseline gap-2 mb-3">
              <h3 className="text-xl font-black text-white font-serif">
                {activeModalItem.nome_piatto}
              </h3>
              <span className="font-serif font-black text-amber-400 text-lg font-mono">
                €{Number(activeModalItem.prezzo).toFixed(2)}
              </span>
            </div>

            {/* MEDIA WRAPPER: MOSTRA IL VIDEO 3D IN AUTOPLAY 9:16 O LA FOTO */}
            <div className="w-full aspect-[9/16] max-h-[42vh] rounded-2xl overflow-hidden relative bg-black border border-white/10 mb-4 flex items-center justify-center shadow-inner">
              {activeModalVideoUrl && activeModalVideoUrl.includes('.mp4') ? (
                <video
                  src={activeModalVideoUrl}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src={activeModalVideoUrl || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=800'}
                  alt={activeModalItem.nome_piatto}
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            {activeModalItem.descrizione && (
              <p className="text-xs text-gray-300 mb-3 leading-relaxed">
                {activeModalItem.descrizione}
              </p>
            )}

            {activeModalItem.storytelling && (
              <div className="bg-white/5 border border-white/10 p-3.5 rounded-2xl text-xs text-gray-200 leading-relaxed mb-3">
                <span className="font-bold text-amber-400 block mb-1">🌱 Dietro le quinte dell&apos;ingrediente:</span>
                {activeModalItem.storytelling}
              </div>
            )}

            {activeModalItem.pairing_vino && (
              <div className="bg-purple-500/10 border border-purple-500/20 p-3.5 rounded-2xl text-xs text-purple-200 flex items-center gap-3 mb-4">
                <Wine size={20} className="text-purple-400 shrink-0" />
                <div>
                  <span className="font-bold block text-white">Abbinamento Sommelier AI:</span>
                  <span>{activeModalItem.pairing_vino}</span>
                </div>
              </div>
            )}

            <button
              onClick={() => {
                updateCart(activeModalItem, 1);
                setActiveModalItem(null);
              }}
              className="w-full py-3.5 rounded-xl font-black text-xs uppercase tracking-wider text-slate-950 shadow-lg cursor-pointer transition active:scale-95 flex items-center justify-center gap-2"
              style={{ backgroundColor: brandColor }}
            >
              <ShoppingBag size={15} /> + Aggiungi al Conto del Tavolo
            </button>
          </div>
        </div>
      )}

      {/* ─── BARRA CARRELLO STICKY IN BASSO (SE CI SONO PIATTI SELEZIONATI) ─── */}
      {totalCartCount > 0 && (
        <aside className="fixed bottom-4 inset-x-4 z-40 max-w-lg mx-auto bg-[#0b0c15]/95 backdrop-blur-2xl border-2 border-amber-500/60 rounded-2xl p-4 shadow-[0_10px_40px_rgba(0,0,0,0.9)] text-white flex items-center justify-between gap-3 animate-in slide-in-from-bottom duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 font-black flex items-center justify-center text-sm shadow">
              {totalCartCount}
            </div>
            <div>
              <div className="text-xs text-stone-300 font-bold">Il tuo conto tavolo</div>
              <div className="text-lg font-black font-serif text-amber-400 font-mono">
                €{totalCartPrice.toFixed(2)}
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsOrderModalOpen(true)}
            className="px-6 py-3 rounded-xl font-black text-xs uppercase tracking-wider text-slate-950 transition shadow-lg active:scale-95 cursor-pointer flex items-center gap-2"
            style={{ backgroundColor: brandColor }}
          >
            <span>Invia Comanda</span> <Send size={14} />
          </button>
        </aside>
      )}

      {/* ─── MODALE INVIO COMANDA WHATSAPP ─── */}
      {isOrderModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md p-4 flex items-center justify-center animate-in fade-in">
          <div className="bg-[#0b0d14] border border-white/20 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-4 relative shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-lg font-bold text-white font-serif flex items-center gap-2">
                <ChefHat className="text-amber-400" /> Riepilogo Comanda Tavolo
              </h3>
              <button onClick={() => setIsOrderModalOpen(false)} className="text-gray-400 hover:text-white cursor-pointer">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1 text-sm divide-y divide-white/5">
              {cartItemsArray.map(item => {
                const sub = item.qty * Number(item.dish.prezzo || 0);
                return (
                  <div key={item.dish.id} className="flex justify-between items-center py-2.5">
                    <div>
                      <span className="font-black text-amber-400 text-base font-mono">{item.qty}x</span> 
                      <span className="text-white font-bold ml-2">{item.dish.nome_piatto}</span>
                    </div>
                    <span className="text-amber-400 font-bold font-serif font-mono">€{sub.toFixed(2)}</span>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-white/10 flex justify-between items-center text-base font-bold">
              <span className="text-gray-300">Totale Conto:</span>
              <span className="text-amber-400 font-serif text-2xl font-black font-mono">€{totalCartPrice.toFixed(2)}</span>
            </div>

            <form onSubmit={handleSendOrder} className="space-y-3.5 pt-1">
              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase mb-1">Tavolo o Posizione</label>
                <input
                  type="text"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  placeholder="es. Tavolo 4, Veranda..."
                  className="w-full bg-[#121522] border border-stone-700 rounded-xl px-4 py-3 text-sm text-white font-bold outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase mb-1">Note per lo Chef (Opzionali)</label>
                <input
                  type="text"
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="es. Senza glutine, cottura media..."
                  className="w-full bg-[#121522] border border-stone-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-amber-400"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm uppercase tracking-wider rounded-xl transition shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <Send size={16} /> Invia Comanda su WhatsApp alla Cucina
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
