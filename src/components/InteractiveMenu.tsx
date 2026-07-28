'use client';

import { useState } from 'react';
import { MenuItem } from '@/types/experience';

interface MenuProps {
  items: MenuItem[];
  brandColor: string;
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

  const categories = ['tutti', ...Array.from(new Set(items.map((i) => i.categoria)))];

  const filteredItems = items.filter((item) => {
    const matchCategory = selectedCategory === 'tutti' || item.categoria === selectedCategory;
    const itemOccasioni = safeArray(item.occasioni);
    const matchMood =
      selectedMood === 'tutti' ||
      itemOccasioni.includes(selectedMood);
    return matchCategory && matchMood;
  });

  return (
    <div className="w-full">
      {/* SELETTORE MOOD / ESPERIENZA */}
      <div className="bg-[#0b0b12] border border-white/10 rounded-3xl p-5 mb-8 shadow-2xl">
        <label className="block text-xs font-black uppercase tracking-widest text-amber-400 mb-3 text-center">
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
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
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

      {/* FILTRO CATEGORIE AD ALTO CONTRASTO (TESTO NERO SU BIANCO / ATTIVO) */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none justify-center">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-5 py-2 rounded-full text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all border ${
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

            return (
              <div
                key={item.id}
                className="bg-[#0c0c14] border border-white/10 hover:border-white/25 rounded-3xl p-5 transition-all flex flex-col justify-between group shadow-xl"
              >
                <div>
                  <div className="flex justify-between items-start gap-3 mb-2">
                    <h4 className="font-black text-white text-lg group-hover:text-amber-400 transition">
                      {item.nome_piatto}
                    </h4>
                    <span className="font-black text-base px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0">
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
                      <span>🍷 Sommelier AI:</span>
                      <span className="font-extrabold">{item.pairing_vino}</span>
                    </div>
                  )}
                </div>

                {/* Allergeni e Storytelling Button */}
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

                  {item.storytelling && (
                    <button
                      onClick={() => setActiveModalItem(item)}
                      className="text-xs font-extrabold text-amber-400 hover:underline flex items-center gap-1 shrink-0"
                    >
                      <span>📖 Scopri la Storia</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODALE STORYTELLING */}
      {activeModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-[#10101a] border border-white/20 rounded-3xl max-w-md w-full p-6 relative shadow-2xl">
            <button
              onClick={() => setActiveModalItem(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white font-bold text-xl"
            >
              ✕
            </button>

            <span className="text-xs uppercase font-black tracking-widest text-amber-400 block mb-1">
              {activeModalItem.categoria}
            </span>
            <h3 className="text-2xl font-black text-white mb-3">
              {activeModalItem.nome_piatto}
            </h3>

            {activeModalItem.foto_url && (
              <img
                src={activeModalItem.foto_url}
                alt={activeModalItem.nome_piatto}
                className="w-full h-52 object-cover rounded-2xl mb-4 border border-white/10"
              />
            )}

            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl text-xs text-gray-200 leading-relaxed mb-4">
              <span className="font-bold text-amber-400 block mb-1">🌱 Dietro le quinte dell'ingrediente:</span>
              {activeModalItem.storytelling}
            </div>

            {activeModalItem.pairing_vino && (
              <div className="bg-purple-500/10 border border-purple-500/20 p-4 rounded-2xl text-xs text-purple-200 flex items-center gap-3">
                <span className="text-2xl">🍷</span>
                <div>
                  <span className="font-bold block text-white">Abbinamento Vino Consigliato:</span>
                  <span>{activeModalItem.pairing_vino}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
