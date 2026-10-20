"use client";

import React, { useState, useEffect, use, useRef } from 'react';
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
  Sparkles,
  Play,
  Upload,
  Film
} from 'lucide-react';

interface GestionePageProps {
  params: Promise<{ slug: string }> | { slug: string };
}

interface LocandaDish {
  id: string;
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

const LOCANDA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5udWh6cnpvZWJ1ZHd5YWxldmh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgzMzUxMTMsImV4cCI6MjEwMzkxMTExM30.oYADAYynRXyQrfnTMgYUeXpIyML4YnS0VQp3y8HIdGU';

// Normalizzazione e matching automatico intelligente
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
  const stopWords = new Set(['con','di','del','della','delle','dei','degli','e','ed','al','alla','alle','in','da','un','una','il','lo','la','i','gli','le']);
  return cleanString(str).split(' ').filter(w => w.length > 2 && !stopWords.has(w));
}

function matchLocandaDish(dishName: string, locandaList: LocandaDish[]): LocandaDish | null {
  if (!dishName || !locandaList.length) return null;

  const cleanedDish = cleanString(dishName);
  const dishKeywords = getKeywords(dishName);

  for (const item of locandaList) {
    const cleanedLocanda = cleanString(item.nome_piatto);
    if (cleanedLocanda === cleanedDish || cleanedLocanda.includes(cleanedDish) || cleanedDish.includes(cleanedLocanda)) {
      return item;
    }
  }

  let best: { item: LocandaDish; score: number } | null = null;
  for (const item of locandaList) {
    const iWords = getKeywords(item.nome_piatto);
    const common = dishKeywords.filter(k => iWords.includes(k)).length;
    const score = common / Math.min(dishKeywords.length, iWords.length || 1);
    if (score >= 0.55 && (!best || score > best.score)) {
      best = { item, score };
    }
  }

  return best ? best.item : null;
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
  const [editingLocandaId, setEditingLocandaId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Modale video grande (60 FPS isolato)
  const [previewVideo, setPreviewVideo] = useState<{ url: string; title: string } | null>(null);

  // Drag & drop upload state
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    categoria: 'Primi Piatti',
    custom_categoria: '',
    nome_piatto: '',
    prezzo: '',
    descrizione: '',
    pairing_vino: '',
    storytelling: '',
    foto_url: '',
    video_url: '',
    is_active: true,
    allergeni: [] as string[]
  });

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        // Query diretta su taste_experiences (PLURALE) per eliminare l'errore 404
        const { data: expData, error } = await supabase
          .from('taste_experiences')
          .select('*')
          .eq('slug', slug)
          .maybeSingle();

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
        `https://nnuhzrzoebudwyalevht.supabase.co/rest/v1/locanda_piatti?or=(restaurant_slug.eq.${encodeURIComponent(slug)},restaurant_slug.eq.ristorante-m4,restaurant_slug.eq.m4-restaurant)&select=id,nome_piatto,video_url&is_active=eq.true&video_url=not.is.null`,
        {
          headers: {
            apikey: LOCANDA_KEY,
            Authorization: `Bearer ${LOCANDA_KEY}`
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

  // GESTIONE UPLOAD VIDEO CON DRAG & DROP
  async function handleVideoFileUpload(file: File) {
    if (!file) return;
    if (!file.type.includes('video')) {
      alert("Seleziona un file video valido (.mp4, .mov, .webm).");
      return;
    }

    setUploadingVideo(true);
    try {
      const fileExt = file.name.split('.').pop() || 'mp4';
      const fileName = `${slug}/${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;

      let uploadBucket = 'videos';
      let { data, error } = await supabase.storage.from('videos').upload(fileName, file, { upsert: true });

      if (error) {
        const fb1 = await supabase.storage.from('taste-videos').upload(fileName, file, { upsert: true });
        if (!fb1.error) { data = fb1.data; uploadBucket = 'taste-videos'; error = null; }
      }
      if (error) {
        const fb2 = await supabase.storage.from('experience').upload(fileName, file, { upsert: true });
        if (!fb2.error) { data = fb2.data; uploadBucket = 'experience'; error = null; }
      }
      if (error) {
        const fb3 = await supabase.storage.from('public').upload(fileName, file, { upsert: true });
        if (!fb3.error) { data = fb3.data; uploadBucket = 'public'; error = null; }
      }

      if (!error && data) {
        const { data: pubData } = supabase.storage.from(uploadBucket).getPublicUrl(data.path);
        setFormData(prev => ({ ...prev, video_url: pubData.publicUrl }));
      } else {
        alert("Upload non riuscito: assicurati che sia configurato un bucket di storage pubblico (es. 'videos') in Supabase.");
      }
    } catch (err: any) {
      alert("Errore caricamento file: " + (err.message || 'Riprova'));
    } finally {
      setUploadingVideo(false);
    }
  }

  function openAddModal() {
    setEditingItem(null);
    setEditingLocandaId(null);
    setFormData({
      categoria: 'Primi Piatti',
      custom_categoria: '',
      nome_piatto: '',
      prezzo: '',
      descrizione: '',
      pairing_vino: '',
      storytelling: '',
      foto_url: '',
      video_url: '',
      is_active: true,
      allergeni: []
    });
    setIsModalOpen(true);
  }

  function openEditModal(item: MenuItem & { is_active?: boolean; video_url?: string }) {
    setEditingItem(item);
    const matchedLocanda = matchLocandaDish(item.nome_piatto, locandaDishes);
    setEditingLocandaId(matchedLocanda?.id || null);

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
      video_url: matchedLocanda?.video_url || item.video_url || '',
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

    const payload: any = {
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

        // Se modificato o rimosso il video, sincronizza anche su Locanda Digitale
        if (editingLocandaId) {
          await fetch(`https://nnuhzrzoebudwyalevht.supabase.co/rest/v1/locanda_piatti?id=eq.${editingLocandaId}`, {
            method: 'PATCH',
            headers: {
              apikey: LOCANDA_KEY,
              Authorization: `Bearer ${LOCANDA_KEY}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=minimal'
            },
            body: JSON.stringify({ video_url: formData.video_url.trim() || null })
          });
        }
      } else {
        const { error } = await supabase.from('taste_menus').insert([payload]);
        if (error) throw error;
      }

      await reloadMenu();
      await loadLocandaVideos3D();
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
            
            const matchedLocanda = matchLocandaDish(item.nome_piatto, locandaDishes);
            const video3DUrl = matchedLocanda?.video_url || (item as any).video_url || null;

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
                {/* THUMBNAIL STATICO AD ALTA PERFORMANCE: ZERO SCATTI, CLICCA PER VEDERE GRANDE */}
                <div 
                  onClick={() => {
                    if (video3DUrl) setPreviewVideo({ url: video3DUrl, title: item.nome_piatto });
                  }}
                  className={`w-16 h-24 rounded-xl overflow-hidden relative bg-black shrink-0 border border-amber-500/40 shadow-lg flex items-center justify-center ${video3DUrl ? 'cursor-pointer hover:border-amber-400 transition-colors group/thumb' : ''}`}
                  title={video3DUrl ? 'Clicca per vedere il video grande' : ''}
                >
                  {video3DUrl ? (
                    <>
                      <video 
                        src={video3DUrl} 
                        preload="metadata"
                        muted 
                        playsInline
                        className="pointer-events-none w-full h-full object-cover" 
                      />
                      <span className="absolute top-1 left-1 px-1 py-0.5 bg-amber-500 text-slate-950 font-black text-[7px] uppercase rounded shadow z-10 pointer-events-none">3D 🎬</span>
                      <div className="absolute inset-0 bg-black/25 flex items-center justify-center group-hover/thumb:bg-black/10 transition-colors">
                        <div className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow">
                          <Play size={10} fill="currentColor" className="ml-0.5" />
                        </div>
                      </div>
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
                      <button 
                        onClick={() => setPreviewVideo({ url: video3DUrl, title: item.nome_piatto })}
                        className="px-2 py-0.5 rounded bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-[9px] font-bold flex items-center gap-1 border border-purple-500/30 cursor-pointer"
                        title="Guarda a schermo intero"
                      >
                        <Sparkles className="w-2.5 h-2.5 text-purple-400" /> Spot 3D Attivo (Guarda)
                      </button>
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

      {/* ─── MODALE PER VEDERE IL VIDEO 3D "GRANDE" (FLUIDO A 60 FPS) ─── */}
      {previewVideo && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-sm rounded-3xl overflow-hidden border border-white/20 shadow-2xl bg-black">
            <button
              onClick={() => setPreviewVideo(null)}
              className="absolute top-3 right-3 z-20 w-10 h-10 rounded-full bg-black/70 text-white flex items-center justify-center border border-white/20 hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
            <div style={{ aspectRatio: '9/16' }} className="relative max-h-[75vh]">
              <video
                src={previewVideo.url}
                autoPlay
                controls
                playsInline
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4 bg-zinc-950 border-t border-white/10 flex justify-between items-center">
              <div>
                <span className="text-[10px] uppercase font-bold text-amber-400 font-mono">Spot 3D Collegato</span>
                <p className="text-xs font-bold text-white truncate">{previewVideo.title}</p>
              </div>
              <button
                onClick={() => setPreviewVideo(null)}
                className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-300 text-xs font-bold hover:text-white cursor-pointer"
              >
                Chiudi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODALE MODIFICA CON DRAG & DROP UPLOAD VIDEO INTEGRATO ─── */}
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

              {/* SEZIONE VIDEO 3D CON DRAG & DROP E MODIFICA / RIMOZIONE */}
              <div className="p-3.5 bg-purple-950/20 border border-purple-500/30 rounded-2xl space-y-3">
                <div className="flex justify-between items-center">
                  <label className="block text-[10px] font-bold uppercase text-purple-300 flex items-center gap-1.5">
                    <Sparkles size={13} className="text-purple-400" /> Video 3D (Spot Animato al Tavolo)
                  </label>
                  {formData.video_url && (
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, video_url: '' }))}
                      className="text-[10px] text-rose-400 hover:text-rose-300 font-bold underline cursor-pointer"
                    >
                      ✕ Rimuovi Video 3D
                    </button>
                  )}
                </div>

                {/* AREA DRAG & DROP */}
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    if (e.dataTransfer.files?.[0]) handleVideoFileUpload(e.dataTransfer.files[0]);
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                    isDragging 
                      ? 'border-purple-400 bg-purple-500/20 scale-[1.01]' 
                      : 'border-purple-500/30 hover:border-purple-400/60 bg-black/40'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/mp4,video/quicktime,video/webm"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) handleVideoFileUpload(e.target.files[0]);
                    }}
                  />

                  {uploadingVideo ? (
                    <div className="flex items-center justify-center gap-2 text-purple-300 font-bold py-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-purple-400" /> Caricamento video in corso...
                    </div>
                  ) : formData.video_url ? (
                    <div className="flex items-center justify-center gap-2 text-emerald-400 font-bold py-1">
                      <Film size={16} /> Video collegato! Trascina qui un altro file per sostituirlo.
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <Upload className="w-5 h-5 text-purple-400 mx-auto" />
                      <p className="text-xs font-bold text-zinc-300">
                        Trascina qui il file video (.mp4) o <span className="text-purple-400 underline">sfoglia</span>
                      </p>
                      <span className="text-[10px] text-zinc-500 block">Formato verticale 9:16 o 16:9</span>
                    </div>
                  )}
                </div>

                {/* OPPURE LINK DIRETTO */}
                <div>
                  <span className="text-[10px] text-zinc-400 block mb-1">Oppure incolla direttamente l&apos;URL del video:</span>
                  <input
                    type="url"
                    placeholder="https://...mp4"
                    value={formData.video_url}
                    onChange={e => setFormData({ ...formData, video_url: e.target.value })}
                    className="w-full bg-zinc-900 border border-purple-500/30 rounded-xl px-3 py-2 text-xs text-purple-200 outline-none focus:border-purple-400 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">URL Foto (Opzionale)</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={formData.foto_url}
                  onChange={e => setFormData({ ...formData, foto_url: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 bg-zinc-900/60 border border-zinc-800 rounded-xl">
                <div>
                  <span className="font-bold text-white text-xs block">Visibile nel Menu al Tavolo</span>
                  <span className="text-[11px] text-zinc-400">Se disattivato, risulterà &quot;Fuori Menu&quot;.</span>
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
                  disabled={submitting || uploadingVideo}
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
