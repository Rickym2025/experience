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
  ChefHat
} from 'lucide-react';

interface GestionePageProps {
  params: Promise<{ slug: string }> | { slug: string };
}

export default function GestioneMenuPage(props: GestionePageProps) {
  // Risoluzione sicura di params sia che arrivi come Promise (Next.js 15) sia come oggetto
  const resolvedParams = React.use(Promise.resolve(props.params));
  const slug = resolvedParams.slug;

  const [experience, setExperience] = useState<TasteExperience | null>(null);
  const [items, setItems] = useState<MenuItem[]>([]);

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

export default function GestioneMenuPage({ params }: GestionePageProps) {
  // Supporto React 19 / Next.js 15
  const resolvedParams = typeof (params as any)?.then === 'function' ? use(params) : params;
  const slug = resolvedParams.slug;

  const [experience, setExperience] = useState<TasteExperience | null>(null);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [authError, setAuthError] = useState('');

  // Filtri & Ricerca
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Modale Aggiungi / Modifica
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    categoria: 'Primi Piatti',
    custom_categoria: '',
    nome_piatto: '',
    prezzo: '',
    descrizione: '',
    pairing_vino: '',
    storytelling: '',
    foto_url: '',
    allergeni: [] as string[]
  });

  // 1. CARICAMENTO DATI INIZIALI
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        // Carica anagrafica ristorante
        const { data: expData } = await supabase
          .from('taste_experiences')
          .select('*')
          .eq('slug', slug)
          .single();

        if (expData) {
          setExperience(expData as TasteExperience);
        }

        // Verifica autenticazione precedente memorizzata
        const savedAuth = localStorage.getItem(`experience_admin_${slug}`);
        if (savedAuth === 'true') {
          setIsAuthorized(true);
        }

        // Carica voci del menu
        await reloadMenu();
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

  // 2. AUTENTICAZIONE RISERVATA TITOLARE (Master PIN o Telefono Ristorante)
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

  // 3. APERTURA MODALE AGGIUNGI / MODIFICA
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
      allergeni: []
    });
    setIsModalOpen(true);
  }

  function openEditModal(item: MenuItem) {
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
      allergeni: Array.isArray(item.allergeni) ? item.allergeni : []
    });
    setIsModalOpen(true);
  }

  function toggleAllergen(allergen: string) {
    setFormData(prev => ({
      ...prev,
      allergeni: prev.allergeni.includes(allergen)
        ? prev.allergeni.filter(a => a !== allergen)
        : [...prev.allergeni, allergen]
    }));
  }

  // 4. SALVATAGGIO / AGGIORNAMENTO SU SUPABASE S1
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
      allergeni: formData.allergeni
    };

    try {
      if (editingItem) {
        // UPDATE
        const { error } = await supabase
          .from('taste_menus')
          .update(payload)
          .eq('id', editingItem.id);

        if (error) throw error;
      } else {
        // INSERT
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

  // 5. CANCELLAZIONE PIATTO
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

  // Categorie uniche presenti per il filtro
  const categoriesPresent = ['all', ...Array.from(new Set(items.map(i => i.categoria)))];

  // Elementi filtrati
  const filteredItems = items.filter(i => {
    const matchesCat = selectedCategory === 'all' || i.categoria === selectedCategory;
    const matchesSearch = 
      i.nome_piatto.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (i.descrizione || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (i.pairing_vino || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // SCREEN 1: SCHERMATA DI SBLOCCO RISERVATA
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#050508] text-white flex items-center justify-center p-4 font-sans selection:bg-amber-500 selection:text-black">
        <div className="max-w-md w-full bg-zinc-950/90 border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/40 flex items-center justify-center text-amber-400 mx-auto shadow-lg">
            <Lock className="w-8 h-8" />
          </div>

          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-amber-400">Area Direzione Locale</span>
            <h1 className="text-xl sm:text-2xl font-black font-serif text-white mt-1">
              {experience?.nome_ristorante || 'Gestione Menu'}
            </h1>
            <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
              Inserisci il <strong>PIN Amministratore</strong> o il cellulare del locale per modificare portate, prezzi e abbinamenti vino.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                placeholder="PIN o Cellulare..."
                value={pinInput}
                onChange={e => setPinInput(e.target.value)}
                className="w-full bg-black/60 border border-zinc-800 rounded-xl px-4 py-3.5 text-center text-white font-mono text-base font-bold focus:border-amber-500 focus:outline-none transition-colors"
                autoFocus
              />
              {authError && (
                <p className="text-xs text-red-400 font-semibold mt-2">{authError}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition shadow-lg active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              <Unlock className="w-4 h-4" /> Sblocca Gestione Menu
            </button>
          </form>

          <div className="pt-2 border-t border-zinc-900">
            <a
              href={`/${slug}`}
              className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Torna alla Carta Pubblica
            </a>
          </div>
        </div>
      </div>
    );
  }

  // SCREEN 2: CONSOLE DI GESTIONE PRINCIPALE
  return (
    <div className="min-h-screen bg-[#050508] text-zinc-200 font-sans selection:bg-amber-500 selection:text-black pb-28">
      {/* HEADER AMMINISTRATIVO */}
      <header className="sticky top-0 z-40 bg-zinc-950/95 border-b border-zinc-900 backdrop-blur-md px-4 py-3.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <a
              href={`/${slug}`}
              className="w-9 h-9 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition shrink-0"
              title="Vedi Carta Pubblica"
            >
              <ArrowLeft className="w-4 h-4" />
            </a>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base font-black text-white font-serif truncate">
                {experience?.nome_ristorante || 'Gestione Menu'}
              </h1>
              <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest font-bold block">
                Console Modifica Menu • {items.length} Voci Attive
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={openAddModal}
              className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition shadow-lg flex items-center gap-1.5 active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Nuovo Piatto / Vino</span>
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

      {/* CONTROLLI, RICERCA & FILTRI */}
      <div className="max-w-6xl mx-auto px-4 pt-6 pb-4 space-y-4">
        {/* BARRA DI RICERCA & LINK RAPIDO */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Cerca piatto, vino o ingrediente..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900/80 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-amber-500 outline-none transition-colors"
            />
          </div>

          <a
            href={`/${slug}`}
            target="_blank"
            className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-bold flex items-center justify-center gap-2 transition"
          >
            <span>Vedi Carta Live</span>
            <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
          </a>
        </div>

        {/* PILLOLE CATEGORIE */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {categoriesPresent.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'bg-zinc-900/90 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800/80'
              }`}
            >
              {cat === 'all' ? `Tutte le Voci (${items.length})` : cat}
            </button>
          ))}
        </div>
      </div>

      {/* LISTA DEI PIATTI E VINI */}
      <main className="max-w-6xl mx-auto px-4 space-y-3">
        {loading ? (
          <div className="py-24 text-center text-zinc-500 text-xs font-bold flex flex-col items-center gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-amber-500" />
            Caricamento voci del menu...
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="py-20 text-center text-zinc-500 bg-zinc-950/40 border border-zinc-900 rounded-3xl p-8 space-y-3">
            <ChefHat className="w-10 h-10 text-zinc-600 mx-auto" />
            <p className="text-sm font-bold text-zinc-400">Nessuna portata o vino trovato con i filtri attuali.</p>
            <button
              onClick={openAddModal}
              className="px-4 py-2 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 font-bold text-xs"
            >
              + Aggiungi il primo elemento
            </button>
          </div>
        ) : (
          filteredItems.map(item => (
            <div
              key={item.id}
              className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-900/80 hover:border-zinc-800 transition flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between shadow-lg"
            >
              <div className="flex-1 space-y-1.5 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-mono font-bold uppercase tracking-wider">
                    {item.categoria}
                  </span>
                  <span className="text-xs text-zinc-500">•</span>
                  <span className="text-base font-black text-amber-400 font-serif">
                    €{Number(item.prezzo).toFixed(2)}
                  </span>
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

              {/* AZIONI RAPIDE */}
              <div className="flex items-center gap-2 self-end sm:self-center shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-900 w-full sm:w-auto justify-end">
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
          ))
        )}
      </main>

      {/* MODALE INSERIMENTO / MODIFICA PIATTO */}
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
              {/* CATEGORIA & PREZZO */}
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

              {/* NOME PIATTO O ETICHETTA VINO */}
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

              {/* DESCRIZIONE */}
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

              {/* ABBINAMENTO VINO (PAIRING) */}
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

              {/* STORYTELLING MATERIA PRIMA */}
              <div>
                <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">Storytelling del Territorio (Opzionale)</label>
                <textarea
                  rows={2}
                  placeholder="La provenienza locale dell'ingrediente, la barca da pesca o la tradizione lagunare..."
                  value={formData.storytelling}
                  onChange={e => setFormData({ ...formData, storytelling: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-500 resize-none"
                />
              </div>

              {/* ALLERGENI CHIP RAPIDE */}
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

              {/* BOTTONI MODALE */}
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
