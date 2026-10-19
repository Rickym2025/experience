"use client";

import React, { useState, useEffect, use } from 'react';
import { supabase } from '@/lib/supabase';
import { MenuItem, TasteExperience } from '@/types/experience';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Search, 
  Lock, 
  Unlock, 
  Wine, 
  Utensils, 
  ArrowLeft, 
  Check, 
  X, 
  ExternalLink, 
  RefreshCw,
  ChefHat,
  Eye,
  EyeOff,
  Sparkles
} from 'lucide-react';

interface GestionePageProps {
  params: Promise<{ slug: string }> | { slug: string };
}

const COMMON_ALLERGENS = [
  'glutine', 'crostacei', 'uova', 'pesce', 'arachidi', 
  'soia', 'latte', 'frutta a guscio', 'sedano', 'senape', 
  'sesamo', 'solfiti', 'lupini', 'molluschi'
];

const PRESET_CATEGORIES = [
  'Crudi di Laguna',
  'Antipasti Cotti',
  'Primi Piatti',
  'Secondi Piatti',
  'Contorni',
  'I Dessert',
  'Menù Degustazione',
  'Bollicine & Champagne',
  'Vini Bianchi',
  'Vini Rossi',
  'Aperitivi & Cocktail'
];

export default function GestioneMenuPage(props: GestionePageProps) {
  const resolvedParams = use(Promise.resolve(props.params));
  const slug = resolvedParams.slug;

  const [experience, setExperience] = useState<TasteExperience | null>(null);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [locandaVideos, setLocandaVideos] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [authError, setAuthError] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    categoria: 'Primi Piatti',
    custom_categoria: '',
    nome_piatto: '',
    prezzo: '',
    descrizione: '',
    pairing_vino: '',
    storytelling: '',
    foto_url: '',
    is_active: true,
    allergeni: [] as string[]
  });

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const { data: expData } = await supabase
          .from('taste_experiences')
          .select('*')
          .eq('slug', slug)
          .single();

        if (expData) {
          setExperience(expData as TasteExperience);
        }

        const savedAuth = localStorage.getItem(`experience_admin_${slug}`);
        if (savedAuth === 'true') {
          setIsAuthorized(true);
        }

        await reloadMenu();
        await loadLocandaVideos3D();
      } catch (err) {
        console.error("Errore caricamento gestione:", err);
      } finally {
        setLoading(false);
      }
    }

    if (slug) loadData();
  }, [slug]);

  async function reloadMenu() {
    const { data: menuData, error } = await supabase
      .from('taste_menus')
      .select('*')
      .eq('experience_slug', slug)
      .order('categoria', { ascending: true })
      .order('nome_piatto', { ascending: true });

    if (!error && menuData) {
      setItems(menuData as MenuItem[]);
    }
  }

  async function loadLocandaVideos3D() {
    try {
      const res = await fetch(
        `https://nnuhzrzoebudwyalevht.supabase.co/rest/v1/locanda_piatti?restaurant_slug=eq.${encodeURIComponent(slug)}&select=nome_piatto,video_url,foto_url&is_active=eq.true`,
        {
          headers: {
            apikey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5udWh6cnpvZWJ1ZHd5YWxldmh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgzMzUxMTMsImV4cCI6MjEwMzkxMTExM30.oYADAYynRXyQrfnTMgYUeXpIyML4YnS0VQp3y8HIdGU',
            Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5udWh6cnpvZWJ1ZHd5YWxldmh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgzMzUxMTMsImV4cCI6MjEwMzkxMTExM30.oYADAYynRXyQrfnTMgYUeXpIyML4YnS0VQp3y8HIdGU'
          },
          cache: 'no-store'
        }
      );
      if (res.ok) {
        const data = await res.json();
        const map: Record<string, string> = {};
        if (Array.isArray(data)) {
          data.forEach(d => {
            if (d.nome_piatto && d.video_url) {
              map[d.nome_piatto.toLowerCase().trim()] = d.video_url;
            }
          });
        }
        setLocandaVideos(map);
      }
    } catch {
      setLocandaVideos({});
    }
  }

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setAuthError('');

    const cleanInput = pinInput.trim().replace(/[^0-9a-zA-Z!]/g, '');
    const cleanPhone = (experience?.phone_number || '').replace(/[^0-9]/g, '');

    const isMaster = cleanInput.toLowerCase() === 'rm2026!';
    const isOwnerPhone = cleanPhone && (
      cleanInput === cleanPhone || 
      cleanPhone.endsWith(cleanInput) || 
      cleanInput === cleanPhone.slice(-6)
    );

    if (isMaster || isOwnerPhone) {
      setIsAuthorized(true);
      localStorage.setItem(`experience_admin_${slug}`, 'true');
    } else {
      setAuthError('Codice non valido. Inserisci il Master PIN o il cellulare del locale.');
    }
  }

  function handleLogout() {
    setIsAuthorized(false);
    localStorage.removeItem(`experience_admin_${slug}`);
    setPinInput('');
  }

  function openAddModal() {
    setEditingItem(null);
    setFormData({
      categoria: 'Primi Piatti',
      custom_categoria: '',
      nome_piatto: '',
      prezzo: '',
      descrizione: '',
      pairing_vino: '',
      storytelling: '',
      foto_url: '',
      is_active: true,
      allergeni: []
    });
    setIsModalOpen(true);
  }

  function openEditModal(item: MenuItem & { is_active?: boolean }) {
    setEditingItem(item);
    const isPresetCat = PRESET_CATEGORIES.includes(item.categoria);
    setFormData({
      categoria: isPresetCat ? item.categoria : 'Altro',
      custom_categoria: isPresetCat ? '' : item.categoria,
      nome_piatto: item.nome_piatto,
      prezzo: item.prezzo.toString(),
      descrizione: item.descrizione || '',
      pairing_vino: item.pairing_vino || '',
      storytelling: item.storytelling || '',
      foto_url: item.foto_url || '',
      is_active: item.is_active !== false,
      allergeni: Array.isArray(item.allergeni) ? item.allergeni : []
    });
    setIsModalOpen(true);
  }

  async function toggleActiveStatus(item: MenuItem & { is_active?: boolean }) {
    const nextState = item.is_active === false ? true : false;
    try {
      const { error } = await supabase
        .from('taste_menus')
        .update({ is_active: nextState })
        .eq('id', item.id);

      if (error) throw error;
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, is_active: nextState } : i));
    } catch (err: any) {
      alert("Errore aggiornamento stato: " + (err.message || 'Riprova'));
    }
  }

  function toggleAllergen(allergen: string) {
    setFormData(prev => ({
      ...prev,
      allergeni: prev.allergeni.includes(allergen)
        ? prev.allergeni.filter(a => a !== allergen)
        : [...prev.allergeni, allergen]
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    const finalCategoria = formData.categoria === 'Altro' && formData.custom_categoria.trim()
      ? formData.custom_categoria.trim()
      : formData.categoria;

    const payload = {
      experience_slug: slug,
      categoria: finalCategoria,
      nome_piatto: formData.nome_piatto.trim(),
      prezzo: parseFloat(formData.prezzo) || 0.00,
      descrizione: formData.descrizione.trim() || null,
      pairing_vino: formData.pairing_vino.trim() || null,
      storytelling: formData.storytelling.trim() || null,
      foto_url: formData.foto_url.trim() || null,
      is_active: formData.is_active,
      allergeni: formData.allergeni
    };

    try {
      if (editingItem) {
        const { error } = await supabase
          .from('taste_menus')
          .update(payload)
          .eq('id', editingItem.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('taste_menus')
          .insert([payload]);

        if (error) throw error;
      }

      await reloadMenu();
      setIsModalOpen(false);
    } catch (err: any) {
      alert("Errore salvataggio: " + (err.message || 'Errore di connessione'));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(item: MenuItem) {
    if (!confirm(`Sei sicuro di voler eliminare "${item.nome_piatto}" dal menu?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('taste_menus')
        .delete()
        .eq('id', item.id);

      if (error) throw error;
      setItems(prev => prev.filter(i => i.id !== item.id));
    } catch (err: any) {
      alert("Errore eliminazione: " + (err.message || 'Riprova più tardi'));
    }
  }

  const categoriesPresent = ['all', ...Array.from(new Set(items.map(i => i.categoria)))];

  const filteredItems = items.filter(i => {
    const matchesCat = selectedCategory === 'all' || i.categoria === selectedCategory;
    const matchesSearch = 
      i.nome_piatto.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (i.descrizione || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (i.pairing_vino || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#050508] text-white flex items-center justify-center p-4 font-sans selection:bg-amber-500 selection:text-black relative overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center opacity-30 scale-105 pointer-events-none" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=2000&q=80')" }} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/85 to-[#050508] pointer-events-none" />

        <div className="max-w-md w-full bg-zinc-950/90 border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-2xl space-y-6 text-center relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400 mx-auto shadow-xl">
            <Lock className="w-8 h-8" />
          </div>

          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-amber-400">Area Direzione Ristorante</span>
            <h1 className="text-xl sm:text-2xl font-black font-serif text-white mt-1">
              {experience?.nome_ristorante || 'Console Gestione'}
            </h1>
            <p className="text-xs text-zinc-300 mt-2 leading-relaxed">
              Inserisci il <strong>PIN Amministratore</strong> o il cellulare del locale per gestire il menu stagionale.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                placeholder="PIN o Cellulare..."
                value={pinInput}
                onChange={e => setPinInput(e.target.value)}
                className="w-full bg-black/70 border border-zinc-800 rounded-xl px-4 py-3.5 text-center text-white font-mono text-base font-bold focus:border-amber-500 focus:outline-none transition-colors"
                autoFocus
              />
              {authError && (
                <p className="text-xs text-red-400 font-semibold mt-2">{authError}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition shadow-xl active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              <Unlock className="w-4 h-4" /> Sblocca Gestione Menu
            </button>
          </form>

          <div className="pt-2 border-t border-zinc-900">
            <a
              href={`/${slug}`}
              className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Torna alla Carta Pubblica
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#04060a] text-zinc-200 font-sans selection:bg-amber-500 selection:text-black pb-28 relative">
      <div 
        className="fixed inset-0 z-0 pointer-events-none bg-cover bg-center opacity-20 scale-105"
        style={{ backgroundImage: `url('${experience?.cover_image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=2000&q=80'}')` }}
      />
      <div className="fixed inset-0 z-0 pointer-events-none bg-gradient-to-b from-[#04060a]/90 via-[#04060a]/95 to-[#04060a]" />

      <header className="sticky top-0 z-40 bg-zinc-950/90 border-b border-zinc-950 backdrop-blur-xl px-4 py-3.5 shadow-2xl">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <a
              href={`/${slug}`}
              className="w-9 h-9 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white flex items-center justify-center transition shrink-0"
              title="Vedi Carta Pubblica"
            >
              <ArrowLeft className="w-4 h-4" />
            </a>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base font-black text-white font-serif truncate flex items-center gap-2">
                <span>{experience?.nome_ristorante || 'Gestione Menu'}</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-mono font-bold uppercase">Stagionale Live</span>
              </h1>
              <span className="text-[10px] font-mono text-zinc-400 block">
                {items.length} Voci Totali • {items.filter(i => (i as any).is_active !== false).length} Attive al Tavolo
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={openAddModal}
              className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition shadow-lg flex items-center gap-1.5 active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Nuova Portata / Vino</span>
            </button>

            <button
              onClick={handleLogout}
              className="w-9 h-9 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-red-400 flex items-center justify-center transition shrink-0 cursor-pointer"
              title="Blocca e Esci"
            >
              <Lock className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-6xl mx-auto px-4 pt-6 pb-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Cerca piatto, vino o ingrediente..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-950/80 border border-zinc-800/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-amber-500 outline-none transition-colors backdrop-blur-md shadow-inner"
            />
          </div>

          <a
            href={`/${slug}`}
            target="_blank"
            className="px-4 py-2.5 rounded-xl bg-zinc-950/80 hover:bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-bold flex items-center justify-center gap-2 transition backdrop-blur-md shadow"
          >
            <span>Vedi Carta Pubblica</span>
            <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
          </a>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {categoriesPresent.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer shadow ${
                selectedCategory === cat
                  ? 'bg-amber-500 text-slate-950 font-black'
                  : 'bg-zinc-950/80 hover:bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800/80 backdrop-blur-md'
              }`}
            >
              {cat === 'all' ? `Tutte le Voci (${items.length})` : cat}
            </button>
          ))}
        </div>
      </div>

      <main className="relative z-10 max-w-6xl mx-auto px-4 space-y-3">
        {loading ? (
          <div className="py-24 text-center text-zinc-500 text-xs font-bold flex flex-col items-center gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-amber-500" />
            Caricamento voci del menu stagionale...
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="py-20 text-center text-zinc-500 bg-zinc-950/60 border border-zinc-900/80 rounded-3xl p-8 space-y-3 backdrop-blur-xl">
            <ChefHat className="w-10 h-10 text-zinc-600 mx-auto" />
            <p className="text-sm font-bold text-zinc-400">Nessuna portata o vino trovato con i filtri attuali.</p>
            <button
              onClick={openAddModal}
              className="px-4 py-2 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 font-bold text-xs cursor-pointer"
            >
              + Aggiungi il primo elemento
            </button>
          </div>
        ) : (
          filteredItems.map(item => {
            const isActive = (item as any).is_active !== false;
            const cleanNameKey = item.nome_piatto.toLowerCase().trim();
            const video3DUrl = locandaVideos[cleanNameKey] || null;

            return (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border transition flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between shadow-xl backdrop-blur-md ${
                  isActive 
                    ? 'bg-zinc-950/85 border-zinc-900/90 hover:border-zinc-800' 
                    : 'bg-zinc-950/40 border-zinc-900/40 opacity-60'
                }`}
              >
                <div className="w-16 h-24 rounded-xl overflow-hidden relative bg-black shrink-0 border border-amber-500/40 shadow-md flex items-center justify-center">
                  {video3DUrl ? (
                    <>
                      <video src={video3DUrl} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                      <span className="absolute top-1 left-1 px-1 py-0.5 bg-amber-500 text-slate-950 font-black text-[7px] uppercase rounded shadow">3D 🎬</span>
                    </>
                  ) : item.foto_url ? (
                    <img src={item.foto_url} alt={item.nome_piatto} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-zinc-900 flex items-center justify-center text-zinc-600 text-[10px] font-bold">Foto</div>
                  )}
                </div>

                <div className="flex-1 space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-mono font-bold uppercase tracking-wider">
                      {item.categoria}
                    </span>
                    <span className="text-xs text-zinc-500">•</span>
                    <span className="text-base font-black text-amber-400 font-serif">
                      €{Number(item.prezzo).toFixed(2)}
                    </span>
                    
                    {!isActive && (
                      <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-300 text-[9px] font-black uppercase tracking-wider">
                        Fuori Menu (Nascosto)
                      </span>
                    )}

                    {video3DUrl && (
                      <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[9px] font-bold flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5" /> Spot 3D Collegato
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold font-serif text-white leading-tight">
                    {item.nome_piatto}
                  </h3>

                  {item.descrizione && (
                    <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                      {item.descrizione}
                    </p>
                  )}

                  {item.pairing_vino && (
                    <div className="flex items-center gap-1.5 text-xs text-purple-300 pt-0.5">
                      <Wine className="w-3.5 h-3.5 shrink-0 text-purple-400" />
                      <span className="truncate">{item.pairing_vino}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-900/80 w-full sm:w-auto justify-end">
                  <button
                    onClick={() => toggleActiveStatus(item)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      isActive 
                        ? 'bg-emerald-950/30 hover:bg-emerald-950/50 border-emerald-500/30 text-emerald-300' 
                        : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-700 text-zinc-400'
                    }`}
                    title={isActive ? 'Nascondi temporaneamente dal menu' : 'Rendi visibile nel menu'}
                  >
                    {isActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    <span>{isActive ? 'Nel Menu' : 'Escluso'}</span>
                  </button>

                  <button
                    onClick={() => openEditModal(item)}
                    className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Modifica
                  </button>

                  <button
                    onClick={() => handleDelete(item)}
                    className="px-3 py-1.5 rounded-xl bg-red-950/20 hover:bg-red-950/40 border border-red-500/20 text-red-400 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                    title="Elimina dal menu"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-5 shadow-2xl relative max-h-[92vh] overflow-y-auto my-8">
            <div className="flex justify-between items-center border-b border-zinc-800/80 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
                  <Utensils className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold font-serif text-white">
                  {editingItem ? 'Modifica Voce Menu' : 'Aggiungi Nuova Portata / Vino'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">Categoria *</label>
                  <select
                    value={formData.categoria}
                    onChange={e => setFormData({ ...formData, categoria: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-white font-bold outline-none focus:border-amber-500"
                  >
                    {PRESET_CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                    <option value="Altro">Altra Categoria Personalizzata...</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">Prezzo (€) *</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    placeholder="24.00"
                    value={formData.prezzo}
                    onChange={e => setFormData({ ...formData, prezzo: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-amber-400 font-mono font-bold outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {formData.categoria === 'Altro' && (
                <div>
                  <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">Nome Nuova Categoria *</label>
                  <input
                    type="text"
                    required
                    placeholder="Es. Specialità Fuori Menu"
                    value={formData.custom_categoria}
                    onChange={e => setFormData({ ...formData, custom_categoria: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-white font-bold outline-none focus:border-amber-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">Nome Piatto o Etichetta Vino *</label>
                <input
                  type="text"
                  required
                  placeholder="Es. Spaghetto Mancini con Canocchie e Cardoncelli"
                  value={formData.nome_piatto}
                  onChange={e => setFormData({ ...formData, nome_piatto: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-white font-bold outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">Descrizione / Ingredienti</label>
                <textarea
                  rows={2}
                  placeholder="Dettagli di lavorazione, ingredienti e consistenze..."
                  value={formData.descrizione}
                  onChange={e => setFormData({ ...formData, descrizione: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-purple-400 mb-1 flex items-center gap-1.5">
                  <Wine className="w-3.5 h-3.5" /> Vino Consigliato dal Sommelier AI
                </label>
                <input
                  type="text"
                  placeholder="Es. Soave DOC Fienile - Corte Sant'Alda (€30)"
                  value={formData.pairing_vino}
                  onChange={e => setFormData({ ...formData, pairing_vino: e.target.value })}
                  className="w-full bg-zinc-900 border border-purple-500/30 rounded-xl px-3 py-2 text-xs text-purple-200 outline-none focus:border-purple-400 font-semibold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">URL Foto (Opzionale)</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={formData.foto_url}
                  onChange={e => setFormData({ ...formData, foto_url: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 bg-zinc-900/60 border border-zinc-800 rounded-xl">
                <div>
                  <span className="font-bold text-white text-xs block">Visibile nel Menu al Tavolo</span>
                  <span className="text-[11px] text-zinc-400">Se disattivato, il piatto risulterà "Fuori Menu" e nascosto agli ospiti.</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1.5">Allergeni Presenti</label>
                <div className="flex flex-wrap gap-1.5">
                  {COMMON_ALLERGENS.map(allergen => {
                    const isSelected = formData.allergeni.includes(allergen);
                    return (
                      <button
                        type="button"
                        key={allergen}
                        onClick={() => toggleAllergen(allergen)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition cursor-pointer flex items-center gap-1 ${
                          isSelected
                            ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                            : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 border border-zinc-800'
                        }`}
                      >
                        {isSelected && <Check className="w-2.5 h-2.5" />}
                        {allergen}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white font-bold transition cursor-pointer"
                >
                  Annulla
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black uppercase tracking-wider rounded-xl transition shadow-lg active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Salvataggio...' : (editingItem ? 'Salva Modifiche' : 'Aggiungi al Menu')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
