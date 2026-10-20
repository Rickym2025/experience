'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MenuItem } from '@/types/experience';
import { Wine, Sparkles, Send, X, ChefHat, UtensilsCrossed, Play } from 'lucide-react';

interface MenuProps {
  items: MenuItem[];
  brandColor: string;
  slug?: string;
  restaurantPhone?: string;
}

interface CartItem {
  dish: MenuItem;
  qty: number;
}

interface LocandaDish {
  nome_piatto: string;
  video_url: string;
}

const safeArray = (data: any): string[] => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (typeof data === 'string') {
    try {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return data.split(',').map((s) => s.trim()).filter(Boolean);
    }
  }
  return [];
};

const WINE_CATEGORIES = [
  'Bollicine & Champagne',
  'Vini Bianchi',
  'Vini Rossi',
  'Aperitivi & Cocktail',
  'Vini da Dessert',
  'Distillati'
];

function cleanString(str: string): string {
  return str
    .toLowerCase()
    .replace(/\([^)]*\)/g, '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function getKeywords(str: string): string[] {
  const stopWords = new Set(['con', 'di', 'del', 'della', 'delle', 'dei', 'degli', 'e', 'ed', 'al', 'alla', 'alle', 'in', 'da', 'un', 'una', 'il', 'lo', 'la', 'i', 'gli', 'le']);
  return cleanString(str).split(' ').filter(word => word.length > 2 && !stopWords.has(word));
}

function matchDishVideo(dishName: string, locandaItems: LocandaDish[]): string | null {
  if (!dishName || !locandaItems.length) return null;

  const cleanedDish = cleanString(dishName);
  const dishKeywords = getKeywords(dishName);

  for (const item of locandaItems) {
    const cleanedLocanda = cleanString(item.nome_piatto);
    if (cleanedLocanda === cleanedDish || cleanedLocanda.includes(cleanedDish) || cleanedDish.includes(cleanedLocanda)) {
      return item.video_url;
    }
  }

  let bestMatch: { video_url: string; score: number } | null = null;
  for (const item of locandaItems) {
    const locandaKeywords = getKeywords(item.nome_piatto);
    if (!locandaKeywords.length || !dishKeywords.length) continue;

    const commonWords = dishKeywords.filter(k => locandaKeywords.includes(k));
    const score = commonWords.length / Math.min(dishKeywords.length, locandaKeywords.length);

    if (score >= 0.55 && (!bestMatch || score > bestMatch.score)) {
      bestMatch = { video_url: item.video_url, score };
    }
  }

  return bestMatch ? bestMatch.video_url : null;
}

export default function InteractiveMenu({ items, brandColor, slug, restaurantPhone }: MenuProps) {
  const [activeTab, setActiveTab] = useState<'cucina' | 'vini'>('cucina');
  const [selectedCategory, setSelectedCategory] = useState<string>('tutte');
  const [activeModalItem, setActiveModalItem] = useState<MenuItem | null>(null);

  const [locandaDishes, setLocandaDishes] = useState<LocandaDish[]>([]);

  const [cart, setCart] = useState<Record<string, CartItem>>({});
  const [isOrderModalOpen, setIsOrderModalOpen] = useState<boolean>(false);
  const [tableNumber, setTableNumber] = useState<string>('Tavolo');
  const [orderNotes, setOrderNotes] = useState<string>('');

  useEffect(() => {
    let effectiveSlug = slug;
    if (!effectiveSlug && typeof window !== 'undefined') {
      const pathSegments = window.location.pathname.split('/').filter(Boolean);
      effectiveSlug = pathSegments[0] || 'ristorante-m4';
    }

    if (effectiveSlug) {
      fetch(
        `https://nnuhzrzoebudwyalevht.supabase.co/rest/v1/locanda_piatti?or=(restaurant_slug.eq.${encodeURIComponent(effectiveSlug)},restaurant_slug.eq.ristorante-m4,restaurant_slug.eq.m4-restaurant)&select=nome_piatto,video_url&is_active=eq.true&video_url=not.is.null`,
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
          if (Array.isArray(data)) setLocandaDishes(data);
        })
        .catch(() => {});
    }
  }, [slug]);

  // Scroll lock + ESC mentre il modale dettagli (col video) è aperto
  useEffect(() => {
    if (!activeModalItem) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setActiveModalItem(null); };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [activeModalItem]);

  const handleTabChange = (tab: 'cucina' | 'vini') => {
    setActiveTab(tab);
    setSelectedCategory('tutte');
  };

  const foodItems = items.filter(i => !WINE_CATEGORIES.some(wc => wc.toLowerCase() === (i.categoria || '').toLowerCase().trim()));
  const wineItems = items.filter(i => WINE_CATEGORIES.some(wc => wc.toLowerCase() === (i.categoria || '').toLowerCase().trim()));

  const currentPool = activeTab === 'cucina' ? foodItems : wineItems;
  const currentCategories = ['tutte', ...Array.from(new Set(currentPool.map((i) => i.categoria)))];

  const filteredItems = currentPool.filter((item) => {
    return selectedCategory === 'tutte' || item.categoria === selectedCategory;
  });

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

    const rawPhone = restaurantPhone || '393495258418';
    const cleanPhone = rawPhone.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`, '_blank');
    setIsOrderModalOpen(false);
  };

  return (
    <div className="w-full pb-32">
      
      {/* ─── MACRO-SELETTORE CUCINA VS VINI ─── */}
      <div className="max-w-md mx-auto mb-6 p-1.5 rounded-2xl bg-zinc-950/80 border border-amber-500/30 backdrop-blur-xl shadow-2xl flex gap-1.5">
        <button
          onClick={() => handleTabChange('cucina')}
          className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'cucina'
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.4)] scale-[1.02]'
              : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <UtensilsCrossed size={16} />
          <span>La Cucina ({foodItems.length})</span>
        </button>

        <button
          onClick={() => handleTabChange('vini')}
          className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'vini'
              ? 'bg-gradient-to-r from-purple-600 to-amber-600 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)] scale-[1.02]'
              : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Wine size={16} />
          <span>Vini &amp; Bar ({wineItems.length})</span>
        </button>
      </div>

      {/* ─── SOTTO-CATEGORIE MULTI-RIGA VISIBILI (ZERO SCROLL, ZERO LINGUETTA) ─── */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 mb-8 max-w-4xl mx-auto px-2">
        {currentCategories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-2 sm:px-4 sm:py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border cursor-pointer ${
              selectedCategory === cat
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.4)] scale-105'
                : 'bg-zinc-950/75 hover:bg-zinc-900 text-zinc-300 border-white/10 hover:border-amber-500/40 hover:text-white backdrop-blur-md'
            }`}
          >
            {cat === 'tutte' ? (activeTab === 'cucina' ? 'Tutte le Portate' : 'Tutte le Etichette') : cat}
          </button>
        ))}
      </div>

      {/* ─── GRIGLIA PORTATE / VINI ─── */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-16 text-zinc-300 bg-zinc-950/60 border border-white/10 rounded-3xl p-8 backdrop-blur-xl">
          Nessuna voce trovata per questa categoria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredItems.map((item) => {
            const allergeniList = safeArray(item.allergeni);
            const videoUrl = matchDishVideo(item.nome_piatto, locandaDishes);

            // Esclude categoricamente le immagini stock Unsplash
            const isUnsplash = (item.foto_url || '').toLowerCase().includes('unsplash.com');
            const realFotoUrl = item.foto_url && !isUnsplash && item.foto_url.trim().length > 0 ? item.foto_url : null;
            
            const hasMedia = Boolean(videoUrl || realFotoUrl);
            const itemQty = cart[item.id]?.qty || 0;
            const isWine = WINE_CATEGORIES.some(wc => wc.toLowerCase() === (item.categoria || '').toLowerCase().trim());

            return (
              <div
                key={item.id}
                className="bg-zinc-950/65 hover:bg-zinc-900/75 border border-amber-500/20 hover:border-amber-500/40 rounded-3xl p-5 transition-all duration-300 flex flex-col justify-between group shadow-2xl backdrop-blur-xl relative overflow-hidden"
              >
                <div>
                  {/* MEDIA BOX: ANTEPRIMA STATICA FLUIDA COME IN VISION (CLICCA PER APRIRE E VEDERE A 60 FPS) */}
                  {hasMedia && (
                    <div 
                      onClick={() => setActiveModalItem(item)}
                      className="w-full h-52 rounded-2xl overflow-hidden relative bg-black mb-4 border border-white/10 cursor-pointer shadow-md group/media [isolation:isolate]"
                    >
                      {videoUrl ? (
                        <>
                          {/* Con il modale aperto smontiamo le anteprime: libera i decoder video di Chrome */}
                          {!activeModalItem && (
                            <video
                              src={`${videoUrl}#t=0.1`}
                              preload="metadata"
                              muted
                              playsInline
                              className="pointer-events-none w-full h-full object-cover"
                            />
                          )}
                          <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full bg-black/80 backdrop-blur-md border border-amber-500/40 text-amber-300 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow z-10 pointer-events-none">
                            <Sparkles size={11} className="text-amber-400" /> Video 3D
                          </div>

                          <div className="absolute inset-0 flex items-center justify-center bg-black/25 group-hover/media:bg-transparent transition-all pointer-events-none">
                            <div className="w-12 h-12 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-xl group-hover/media:scale-110 transition-transform">
                              <Play size={20} fill="currentColor" className="ml-0.5" />
                            </div>
                          </div>
                        </>
                      ) : (
                        <img
                          src={realFotoUrl!}
                          alt={item.nome_piatto}
                          className="w-full h-full object-cover group-hover/media:scale-105 transition-transform duration-500"
                        />
                      )}
                    </div>
                  )}

                  <div className="flex justify-between items-start gap-3 mb-2">
                    <div>
                      <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-amber-400/80 block mb-0.5">
                        {item.categoria}
                      </span>
                      <h4 className="font-black text-white text-lg group-hover:text-amber-300 transition leading-tight">
                        {item.nome_piatto}
                      </h4>
                    </div>

                    <span className="font-black text-base px-3 py-1 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 shrink-0 font-mono">
                      €{Number(item.prezzo).toFixed(2)}
                    </span>
                  </div>

                  {item.descrizione && (
                    <p className="text-xs text-zinc-300 leading-relaxed line-clamp-3 mb-4 font-normal">
                      {item.descrizione}
                    </p>
                  )}

                  {!isWine && item.pairing_vino && (
                    <div className="inline-flex items-center gap-2 text-xs text-purple-200 bg-purple-500/15 border border-purple-500/30 px-3.5 py-1.5 rounded-xl mb-4">
                      <Wine size={14} className="text-purple-400 shrink-0" />
                      <span>Sommelier: <strong className="font-extrabold">{item.pairing_vino}</strong></span>
                    </div>
                  )}
                </div>

                {/* Footer Card */}
                <div className="pt-3 border-t border-white/10 flex justify-between items-center gap-2">
                  <div className="flex flex-wrap gap-1">
                    {allergeniList.map((all, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] uppercase font-bold text-zinc-400 bg-white/5 border border-white/5 px-2 py-0.5 rounded-md"
                      >
                        {all}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <button
                      onClick={() => setActiveModalItem(item)}
                      className="text-xs font-bold text-amber-400 hover:text-amber-300 transition cursor-pointer"
                    >
                      Dettagli ➔
                    </button>

                    <div className="flex items-center gap-1 bg-black/80 border border-white/15 rounded-xl p-0.5 shadow">
                      <button
                        onClick={() => updateCart(item, -1)}
                        className="w-7 h-7 rounded-lg bg-white/10 text-white font-bold flex items-center justify-center active:scale-90 cursor-pointer text-xs hover:bg-white/20 transition"
                      >
                        -
                      </button>
                      <span className="text-xs font-mono font-black text-white px-2">{itemQty}</span>
                      <button
                        onClick={() => updateCart(item, 1)}
                        className="w-7 h-7 rounded-lg text-slate-950 font-black flex items-center justify-center active:scale-90 cursor-pointer text-xs shadow"
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

      {/* ─── MODALE DETTAGLI (VIDEO SINGOLO RIPRODOTTO FLUIDO A SCHERMO INTERO A 60 FPS) ─── */}
      {/* Portal su body + overlay opaco SENZA backdrop-filter né animazioni: il blur attorno a un <video> costringe Chrome a ricalcolarlo a ogni frame */}
      {activeModalItem && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black" onClick={() => setActiveModalItem(null)}>
          <div onClick={e => e.stopPropagation()} className="bg-[#0f1019] border border-amber-500/30 rounded-3xl max-w-md w-full p-6 relative max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setActiveModalItem(null)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white font-bold text-xl cursor-pointer z-10 w-8 h-8 rounded-full bg-black/70 flex items-center justify-center border border-white/10"
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

            {(() => {
              const modalVideo = matchDishVideo(activeModalItem.nome_piatto, locandaDishes);
              const isUnsplash = (activeModalItem.foto_url || '').toLowerCase().includes('unsplash.com');
              const modalFoto = activeModalItem.foto_url && !isUnsplash && activeModalItem.foto_url.trim().length > 0 ? activeModalItem.foto_url : null;

              if (modalVideo) {
                return (
                  <div className="w-full aspect-[9/16] max-h-[44vh] rounded-2xl overflow-hidden relative bg-black border border-white/10 mb-4 flex items-center justify-center">
                    <video
                      src={modalVideo}
                      autoPlay
                      loop
                      muted
                      playsInline
                      controls
                      preload="auto"
                      className="w-full h-full object-cover"
                    />
                  </div>
                );
              }
              if (modalFoto) {
                return (
                  <div className="w-full aspect-[16/9] max-h-[35vh] rounded-2xl overflow-hidden relative bg-black border border-white/10 mb-4 flex items-center justify-center shadow-inner">
                    <img
                      src={modalFoto}
                      alt={activeModalItem.nome_piatto}
                      className="w-full h-full object-cover"
                    />
                  </div>
                );
              }
              return null;
            })()}

            {activeModalItem.descrizione && (
              <p className="text-xs text-zinc-300 mb-3 leading-relaxed">
                {activeModalItem.descrizione}
              </p>
            )}

            {activeModalItem.storytelling && (
              <div className="bg-white/5 border border-white/10 p-3.5 rounded-2xl text-xs text-zinc-200 leading-relaxed mb-3">
                <span className="font-bold text-amber-400 block mb-1">🌱 Dietro le quinte dell&apos;ingrediente:</span>
                {activeModalItem.storytelling}
              </div>
            )}

            {activeModalItem.pairing_vino && (
              <div className="bg-purple-500/15 border border-purple-500/30 p-3.5 rounded-2xl text-xs text-purple-200 flex items-center gap-3 mb-4">
                <Wine size={20} className="text-purple-400 shrink-0" />
                <div>
                  <span className="font-bold block text-white">Abbinamento Sommelier:</span>
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
              + Aggiungi al Conto del Tavolo
            </button>
          </div>
        </div>,
        document.body
      )}

      {/* ─── CARRELLO FLUTTUANTE AL TAVOLO ─── */}
      {totalCartCount > 0 && (
        <aside className="fixed bottom-4 inset-x-4 z-40 max-w-lg mx-auto bg-zinc-950/95 backdrop-blur-2xl border-2 border-amber-500/60 rounded-2xl p-4 shadow-[0_10px_40px_rgba(0,0,0,0.9)] text-white flex items-center justify-between gap-3 animate-in slide-in-from-bottom duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 font-black flex items-center justify-center text-sm shadow">
              {totalCartCount}
            </div>
            <div>
              <div className="text-xs text-zinc-400 font-bold">Il tuo ordine al tavolo</div>
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

      {/* ─── MODALE INVIO COMANDA SU WHATSAPP ─── */}
      {isOrderModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md p-4 flex items-center justify-center animate-in fade-in">
          <div className="bg-[#0b0d14] border border-amber-500/30 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-4 relative shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-lg font-bold text-white font-serif flex items-center gap-2">
                <ChefHat className="text-amber-400" /> Riepilogo Comanda Tavolo
              </h3>
              <button onClick={() => setIsOrderModalOpen(false)} className="text-zinc-400 hover:text-white cursor-pointer">
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
              <span className="text-zinc-300">Totale Conto:</span>
              <span className="text-amber-400 font-serif text-2xl font-black font-mono">€{totalCartPrice.toFixed(2)}</span>
            </div>

            <form onSubmit={handleSendOrder} className="space-y-3.5 pt-1">
              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">Tavolo o Posizione</label>
                <input
                  type="text"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  placeholder="es. Tavolo 4, Veranda, Sala..."
                  className="w-full bg-[#121522] border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white font-bold outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">Note per lo Chef (Opzionali)</label>
                <input
                  type="text"
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="es. Senza cipolla, vino al secchiello..."
                  className="w-full bg-[#121522] border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-amber-400"
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
