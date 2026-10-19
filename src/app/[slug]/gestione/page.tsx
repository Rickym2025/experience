"use client";

import React, { useState, useEffect, use } from 'react';
import { supabase } from '@/lib/supabase';
import { MenuItem, TasteExperience } from '@/types/experience';
import NexusWidget from '@/components/NexusWidget';
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

interface LocandaDish {
  nome_piatto: string;
  video_url: string;
}

const COMMON_ALLERGENS = [
  'glutine', 'crostacei', 'uova', 'pesce', 'arachidi', 
  'soia', 'latte', 'frutta a guscio', 'sedano', 'senape', 
  'sesamo', 'solfiti', 'lupini', 'molluschi'
];

const PRESET_CATEGORIES = [
  'Crudi di Laguna', 'Antipasti Cotti', 'Primi Piatti', 'Secondi Piatti', 
  'Contorni', 'I Dessert', 'Menù Degustazione', 'Bollicine & Champagne', 
  'Vini Bianchi', 'Vini Rossi', 'Aperitivi & Cocktail'
];

// Matching automatico compatto Locanda ➔ Gestione
function findLocandaVideo(dishName: string, locandaList: LocandaDish[]): string | null {
  if (!dishName || !locandaList.length) return null;
  const getWords = (s: string) =>
    s.toLowerCase()
      .replace(/\([^)]*\)/g, '')
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 2 && !['con','del','della','delle','dei','degli','per','alla','alle'].includes(w));

  const dWords = getWords(dishName);
  let best: { url: string; score: number } | null = null;

  for (const item of locandaList) {
    const iWords = getWords(item.nome_piatto);
    const common = dWords.filter(w => iWords.includes(w)).length;
    const score = common / Math.min(dWords.length, iWords.length || 1);
    if (score >= 0.55 && (!best || score > best.score)) {
      best = { url: item.video_url, score };
    }
  }
  return best?.url || null;
}

export default function GestioneMenuPage(props: GestionePageProps) {
  const resolvedParams = use(Promise.resolve(props.params));
  const slug = resolvedParams.slug;

  const [experience, setExperience] = useState<TasteExperience | null>(null);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [locandaDishes, setLocandaDishes] = useState<LocandaDish[]>([]);
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
        let expData: any = null;
        const resSingle = await supabase.from('taste_experience').select('*').eq('slug', slug).maybeSingle();
        if (resSingle.data) {
          expData = resSingle.data;
        } else {
          const resPlural = await supabase.from('taste_experiences').select('*').eq('slug', slug).maybeSingle();
          expData = resPlural.data;
        }

        if (expData) setExperience(expData as TasteExperience);

        if (localStorage.getItem(`experience_admin_${slug}`) === 'true') {
          setIsAuthorized(true);
        }

        await reloadMenu();
        await loadLocandaVideos3D();
      } catch (err) {
        console.error("Errore caricamento:", err);
      } finally {
        setLoading(false);
      }
    }

    if (slug) loadData();
  }, [slug]);

  async function reloadMenu() {
    let menuData: any[] | null = null;
    const { data: dPlural } = await supabase
      .from('taste_menus')
      .select('*')
      .eq('experience_slug', slug)
      .order('categoria', { ascending: true })
      .order('nome_piatto', { ascending: true });

    if (dPlural && dPlural.length > 0) {
      menuData = dPlural;
    } else {
      const { data: dSample } = await supabase
        .from('taste_menu')
        .select('*')
        .eq('experience_slug', slug)
        .order('categoria', { ascending: true })
        .order('nome_piatto', { ascending: true });
      menuData = dSample;
    }

    if (menuData) setItems(menuData as MenuItem[]);
  }

  async function loadLocandaVideos3D() {
    try {
      const res = await fetch(
        `https://nnuhzrzoebudwyalevht.supabase.co/rest/v1/locanda_piatti?or=(restaurant_slug.eq.${encodeURIComponent(slug)},restaurant_slug.eq.ristorante-m4,restaurant_slug.eq.m4-restaurant)&select=nome_piatto,video_url&is_active=eq.true&video_url=not.is.null`,
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
        if (Array.isArray(data)) setLocandaDishes(data);
      }
    } catch {
      setLocandaDishes([]);
    }
  }

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setAuthError('');
    const cleanInput = pinInput.trim().replace(/[^0-9a-zA-Z!]/g, '');
    const cleanPhone = (experience?.phone_number || '').replace(/[^0-9]/g, '');

    const isMaster = cleanInput.toLowerCase() === 'rm2026!';
    const isOwnerPhone = cleanPhone && (cleanInput === cleanPhone || cleanPhone.endsWith(cleanInput) || cleanInput === cleanPhone.slice(-6));

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
      const { error } = await supabase.from('taste_menus').update({ is_active: nextState }).eq('id', item.id);
      if (error) throw error;
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, is_active: nextState } : i));
    } catch (err: any) {
      alert("Errore aggiornamento: " + (err.message || 'Riprova'));
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
        const { error } = await supabase.from('taste_menus').update(payload).eq('id', editingItem.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('taste_menus').insert([payload]);
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
    if (!confirm(`Vuoi eliminare "${item.nome_piatto}"?`)) return;
    try {
      const { error } = await supabase.from('taste_menus').delete().eq('id', item.id);
      if (error) throw error;
      setItems(prev => prev.filter(i => i.id !== item.id));
    } catch (err: any) {
      alert("Errore eliminazione: " + (err.message || 'Riprova'));
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

  const bgCoverUrl = experience?.cover_image || 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=2000&q=85';
  const brandColor = experience?.brand_color || '#d97706';

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#07080f] text-white flex items-center justify-center p-4 font-sans selection:bg-amber-500 selection:text-black relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-45 scale-105 pointer-events-none" 
          style={{ backgroundImage: `url('${bgCoverUrl}')` }} 
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-[#05060b] via-[#0b0c16]/80 to-[#190e0c]/60 pointer-events-none" />

        <div className="max-w-md w-full bg-zinc-950/85 border border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-2xl space-y-6 text-center relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400 mx-auto">
            <Lock className="w-8 h-8" />
          </div>

          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-amber-400">Area Direzione</span>
            <h1 className="text-xl sm:text-2xl font-black font-serif text-white mt-1">
              {experience?.nome_ristorante || 'Console Gestione'}
            </h1>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                placeholder="PIN o Cellulare..."
                value={pinInput}
                onChange={e => setPinInput(e.target.value)}
                className="w-full bg-black/80 border border-zinc-800 focus:border-amber-500 rounded-xl px-4 py-3.5 text-center text-white font-mono text-base font-bold outline-none"
                autoFocus
              />
              {authError && <p className="text-xs text-red-400 font-semibold mt-2">{authError}</p>}
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition shadow-lg active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              <Unlock className="w-4 h-4" /> Sblocca Gestione Menu
            </button>
          </form>

          <div className="pt-2 border-t border-zinc-900">
            <a href={`/${slug}`} className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-amber-300">
              <ArrowLeft className="w-3.5 h-3.5" /> Torna alla Carta Pubblica
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07080f] text-zinc-200 font-sans selection:bg-amber-500 selection:text-black pb-36 relative overflow-x-hidden">
      <div 
        className="fixed inset-0 z-0 pointer-events-none bg-cover bg-center opacity-45 scale-105" 
        style={{ backgroundImage: `url('${bgCoverUrl}')` }} 
      />
      <div className="fixed inset-0 z-0 pointer-events-none bg-gradient-to-b from-black/55 via-[#080913]/70 to-[#040509]/85" />

      <header className="sticky top-0 z-40 bg-zinc-950/75 border-b border-amber-500/30 backdrop-blur-2xl px-4 py-3.5 shadow-2xl">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <a href={`/${slug}`} className="w-9 h-9 rounded-xl bg-zinc-900 hover:bg-amber-500/20 border border-zinc-800 text-zinc-300 hover:text-amber-300 flex items-center justify-center transition shrink-0">
              <ArrowLeft className="w-4 h-4" />
            </a>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base font-black text-white font-serif truncate flex items-center gap-2">
                <span>{experience?.nome_ristorante || 'Gestione Menu'}</span>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-300 text-[10px] font-mono font-bold uppercase">Live</span>
              </h1>
              <span className="text-[10px] font-mono text-zinc-400 block">
                {items.length} Voci • <span className="text-emerald-400 font-bold">{items.filter(i => (i as any).is_active !== false).length} Attive</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button onClick={openAddModal} className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition shadow-lg flex items-center gap-1.5 active:scale-95 cursor-pointer">
              <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Nuova Voce</span>
            </button>
            <button onClick={handleLogout} className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-rose-400 flex items-center justify-center transition cursor-pointer">
              <Lock className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-6xl mx-auto px-4 pt-6 pb-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-400" />
            <input
              type="text"
              placeholder="Cerca piatto, vino o ingrediente..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-950/75 border border-zinc-800/80 focus:border-amber-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-400 outline-none backdrop-blur-xl"
            />
          </div>
          <a href={`/${slug}`} target="_blank" className="px-4 py-2.5 rounded-xl bg-zinc-950/75 hover:bg-zinc-900 border border-amber-500/30 text-amber-200 text-xs font-bold flex items-center justify-center gap-2 transition backdrop-blur-xl">
            <span>Vedi Carta Pubblica</span> <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
          </a>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {categoriesPresent.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black'
                  : 'bg-zinc-950/75 hover:bg-zinc-900 text-zinc-300 border border-zinc-800 backdrop-blur-xl'
              }`}
            >
              {cat === 'all' ? `Tutte (${items.length})` : cat}
            </button>
          ))}
        </div>
      </div>

      <main className="relative z-10 max-w-6xl mx-auto px-4 space-y-3">
        {loading ? (
          <div className="py-24 text-center text-zinc-300 text-xs font-bold flex flex-col items-center gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-amber-500" /> Caricamento...
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="py-20 text-center text-zinc-300 bg-zinc-950/65 border border-amber-500/30 rounded-3xl p-8 space-y-3 backdrop-blur-xl">
            <ChefHat className="w-10 h-10 text-amber-500/60 mx-auto" />
            <p className="text-sm font-bold text-zinc-200">Nessuna voce trovata.</p>
          </div>
        ) : (
          filteredItems.map(item => {
            const isActive = (item as any).is_active !== false;
            
            // Video automatico da Locanda con matching intelligente
            const video3DUrl = findLocandaVideo(item.nome_piatto, locandaDishes);

            // Filtro immagini Unsplash
            const isUnsplash = (item.foto_url || '').toLowerCase().includes('unsplash.com');
            const realFoto = item.foto_url && !isUnsplash ? item.foto_url : null;

            return (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between shadow-2xl backdrop-blur-xl ${
                  isActive 
                    ? 'bg-zinc-950/65 hover:bg-zinc-900/75 border-amber-500/25' 
                    : 'bg-zinc-950/40 border-zinc-900/60 opacity-60'
                }`}
              >
                <div className="w-16 h-24 rounded-xl overflow-hidden relative bg-black shrink-0 border border-amber-500/40 shadow-lg flex items-center justify-center [isolation:isolate]">
                  {video3DUrl ? (
                    <>
                      <video 
                        src={video3DUrl} 
                        autoPlay 
                        loop 
                        muted 
                        playsInline 
                        preload="auto"
                        style={{ transform: 'translate3d(0, 0, 0)', willChange: 'transform' }}
                        className="pointer-events-none w-full h-full object-cover" 
                      />
                      <span className="absolute top-1 left-1 px-1 py-0.5 bg-amber-500 text-slate-950 font-black text-[7px] uppercase rounded shadow z-10 pointer-events-none">3D 🎬</span>
                    </>
                  ) : realFoto ? (
                    <img src={realFoto} alt={item.nome_piatto} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-zinc-900/80 flex flex-col items-center justify-center text-amber-400/70 text-[10px] font-bold">
                      <Utensils className="w-4 h-4 mb-1 text-amber-500/50" /> Testo
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-mono font-bold uppercase">
                      {item.categoria}
                    </span>
                    <span className="text-base font-black text-amber-400 font-serif">
                      €{Number(item.prezzo).toFixed(2)}
                    </span>
                    {!isActive && (
                      <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[9px] font-black uppercase">
                        Fuori Menu
                      </span>
                    )}
                    {video3DUrl && (
                      <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[9px] font-bold flex items-center gap-1 border border-purple-500/30">
                        <Sparkles className="w-2.5 h-2.5 text-purple-400" /> Spot 3D Collegato
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold font-serif text-white leading-tight">
                    {item.nome_piatto}
                  </h3>

                  {item.descrizione && (
                    <p className="text-xs text-zinc-300 line-clamp-2 leading-relaxed">
                      {item.descrizione}
                    </p>
                  )}

                  {item.pairing_vino && (
                    <div className="flex items-center gap-1.5 text-xs text-purple-300 pt-0.5 font-medium">
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
                        ? 'bg-emerald-950/40 hover:bg-emerald-950/60 border-emerald-500/40 text-emerald-300' 
                        : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-700 text-zinc-400'
                    }`}
                  >
                    {isActive ? <Eye className="w-3.5 h-3.5 text-emerald-400" /> : <EyeOff className="w-3.5 h-3.5" />}
                    <span>{isActive ? 'Nel Menu' : 'Escluso'}</span>
                  </button>

                  <button
                    onClick={() => openEditModal(item)}
                    className="px-3 py-1.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 hover:text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-amber-400" /> Modifica
                  </button>

                  <button
                    onClick={() => handleDelete(item)}
                    className="px-3 py-1.5 rounded-xl bg-rose-950/30 hover:bg-rose-950/60 border border-rose-500/30 text-rose-300 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </main>

      <NexusWidget
        botId={experience?.nexus_bot_id || slug}
        restaurantSlug={slug}
        brandColor={brandColor}
        nomeRistorante={experience?.nome_ristorante || 'Locanda'}
        logoUrl={experience?.logo_url}
        ownerName={experience?.owner_name}
      />

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-zinc-950 border border-amber-500/30 rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-5 shadow-2xl relative max-h-[92vh] overflow-y-auto my-8">
            <div className="flex justify-between items-center border-b border-zinc-800/80 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                  <Utensils className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold font-serif text-white">
                  {editingItem ? 'Modifica Voce' : 'Nuova Portata / Vino'}
                </h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 rounded-full bg-zinc-900 text-zinc-400 hover:text-white flex items-center justify-center transition cursor-pointer">
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
                    {PRESET_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    <option value="Altro">Altra Categoria...</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">Prezzo (€) *</label>
                  <input
                    type="number"
                    step="0.5"
                    required
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
                  value={formData.nome_piatto}
                  onChange={e => setFormData({ ...formData, nome_piatto: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-white font-bold outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">Descrizione / Ingredienti</label>
                <textarea
                  rows={2}
                  value={formData.descrizione}
                  onChange={e => setFormData({ ...formData, descrizione: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-purple-400 mb-1 flex items-center gap-1.5">
                  <Wine className="w-3.5 h-3.5" /> Vino Consigliato (Sommelier AI)
                </label>
                <input
                  type="text"
                  value={formData.pairing_vino}
                  onChange={e => setFormData({ ...formData, pairing_vino: e.target.value })}
                  className="w-full bg-zinc-900 border border-purple-500/40 rounded-xl px-3 py-2 text-xs text-purple-200 outline-none focus:border-purple-400 font-semibold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">URL Foto (Opzionale)</label>
                <input
                  type="url"
                  value={formData.foto_url}
                  onChange={e => setFormData({ ...formData, foto_url: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 bg-zinc-900/60 border border-zinc-800 rounded-xl">
                <div>
                  <span className="font-bold text-white text-xs block">Visibile nel Menu al Tavolo</span>
                  <span className="text-[11px] text-zinc-400">Se disattivato, risulterà "Fuori Menu".</span>
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
                          isSelected ? 'bg-amber-500 text-slate-950 font-black' : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
                        }`}
                      >
                        {isSelected && <Check className="w-2.5 h-2.5" />} {allergen}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-zinc-900 text-zinc-400 hover:text-white font-bold transition cursor-pointer"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black uppercase tracking-wider rounded-xl transition shadow-lg active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Salvataggio...' : (editingItem ? 'Salva Modifiche' : 'Aggiungi')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
