'use client';

import { useState, useEffect, useRef } from 'react';
import { ChefHat, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Message {
  sender: 'bot' | 'user';
  text: string;
}

interface NexusWidgetProps {
  botId: string;
  restaurantSlug?: string;
  brandColor?: string;
  nomeRistorante?: string;
  logoUrl?: string | null;
  ownerName?: string | null;
}

export default function NexusWidget({
  botId,
  restaurantSlug,
  brandColor = '#d97706',
  nomeRistorante = 'Ristorante',
  logoUrl,
  ownerName,
}: NexusWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentLogo, setCurrentLogo] = useState<string | null>(logoUrl || null);
  const [imgError, setImgError] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const effectiveSlug = restaurantSlug || botId;
  const storageKey = `nexus_chat_${effectiveSlug}`;
  const historyKey = `nexus_history_${effectiveSlug}`;

  const maitreTitle = ownerName ? `Maître Virtuale di ${ownerName}` : `Maître Virtuale AI`;

  // RECUPERO DINAMICO LOGO DA SUPABASE (SE NON PRESENTE NELLE PROPS)
  useEffect(() => {
    if (logoUrl) {
      setCurrentLogo(logoUrl);
      setImgError(false);
      return;
    }

    async function fetchLogoFromSupabase() {
      if (!effectiveSlug) return;
      try {
        let logoFound: string | null = null;
        
        // 1. Prova tabella taste_experience
        const { data: dSingle } = await supabase
          .from('taste_experience')
          .select('logo_url')
          .eq('slug', effectiveSlug)
          .maybeSingle();

        if (dSingle?.logo_url) {
          logoFound = dSingle.logo_url;
        } else {
          // 2. Fallback su taste_experiences
          const { data: dPlural } = await supabase
            .from('taste_experiences')
            .select('logo_url')
            .eq('slug', effectiveSlug)
            .maybeSingle();
          if (dPlural?.logo_url) logoFound = dPlural.logo_url;
        }

        if (logoFound) {
          setCurrentLogo(logoFound);
          setImgError(false);
        }
      } catch (err) {
        console.warn('Errore recupero logo:', err);
      }
    }

    fetchLogoFromSupabase();
  }, [logoUrl, effectiveSlug]);

  const hasValidLogo = !imgError && Boolean(currentLogo && currentLogo.trim().length > 5);

  useEffect(() => {
    const savedHistory = sessionStorage.getItem(historyKey);
    if (savedHistory) {
      try {
        setMessages(JSON.parse(savedHistory));
      } catch (e) {
        initWelcomeMessages();
      }
    } else {
      initWelcomeMessages();
    }
  }, [effectiveSlug]);

  const initWelcomeMessages = () => {
    const welcomeText = ownerName
      ? `Benvenuto da **${nomeRistorante}**! 🍷\nSono il Maître Virtuale di **${ownerName}**. Cosa posso fare per te stasera?`
      : `Benvenuto da **${nomeRistorante}**! 🍷\nSono il Maître Virtuale. Cosa posso fare per te stasera?`;

    const welcome: Message[] = [{ sender: 'bot', text: welcomeText }];
    setMessages(welcome);
    sessionStorage.setItem(historyKey, JSON.stringify(welcome));
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isLoading) return;

    let sessionId = sessionStorage.getItem(storageKey);
    if (!sessionId) {
      sessionId = 'exp_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
      sessionStorage.setItem(storageKey, sessionId);
    }

    const newMessages: Message[] = [...messages, { sender: 'user', text }];
    setMessages(newMessages);
    sessionStorage.setItem(historyKey, JSON.stringify(newMessages));
    setInputValue('');
    setIsLoading(true);

    try {
      const res = await fetch('https://n8n.rmstudio.app/webhook/chatbot-builder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          sessionId: sessionId,
          strutturaId: botId || effectiveSlug,
        }),
      });

      const data = await res.json();
      const replyText = data.response || data.output || 'Siamo a tua disposizione per qualsiasi richiesta.';

      const updatedMessages: Message[] = [
        ...newMessages,
        { sender: 'bot', text: replyText },
      ];
      setMessages(updatedMessages);
      sessionStorage.setItem(historyKey, JSON.stringify(updatedMessages));
    } catch (err) {
      const errorMsg: Message = {
        sender: 'bot',
        text: 'Servizio temporaneamente non disponibile. Riprova tra poco.',
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* BOTTONE FLUTTUANTE: Posizionato a bottom-28 (sm:bottom-32) SOPRA il pulsante 'Invito Riserva di Cantina' */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-28 sm:bottom-32 left-4 sm:left-5 z-50 w-16 h-16 rounded-full bg-zinc-950/95 border-2 text-white flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer overflow-hidden backdrop-blur-2xl group"
          style={{
            borderColor: brandColor,
            boxShadow: `0 0 25px ${brandColor}70, 0 10px 25px rgba(0,0,0,0.7)`,
          }}
          title={maitreTitle}
        >
          <div className="relative w-full h-full flex items-center justify-center p-2 bg-gradient-to-br from-zinc-900 to-black">
            {hasValidLogo ? (
              <img
                src={currentLogo!}
                alt={nomeRistorante}
                onError={() => setImgError(true)}
                className="w-full h-full object-contain drop-shadow"
              />
            ) : (
              <ChefHat size={28} style={{ color: brandColor }} className="drop-shadow" />
            )}

            {/* Indicatore verde/brand pulsante 'Live' */}
            <span
              className="absolute top-1 right-1 w-3 h-3 rounded-full border-2 border-black animate-pulse"
              style={{ backgroundColor: brandColor }}
            />
          </div>
        </button>
      )}

      {/* FINESTRA CHAT APERTA ANCH'ESSA SOPRA IL PULSANTE DI RISERVA */}
      {isOpen && (
        <div
          className="fixed z-50 inset-0 sm:inset-auto sm:bottom-28 sm:left-4 sm:w-[450px] sm:h-[620px] bg-[#0c0d14]/98 backdrop-blur-3xl border-0 sm:border-2 rounded-none sm:rounded-3xl flex flex-col overflow-hidden shadow-2xl transition-all resize sm:resize-both"
          style={{
            borderColor: `${brandColor}90`,
            boxShadow: `0 0 45px ${brandColor}40, 0 20px 40px rgba(0,0,0,0.85)`,
            minWidth: '340px',
            maxWidth: '700px',
            minHeight: '480px',
            maxHeight: '82vh',
          }}
        >
          {/* HEADER CHAT CON LOGO UFFICIALE */}
          <div
            className="p-4 border-b flex items-center justify-between shrink-0 bg-gradient-to-r from-zinc-950 via-[#13141f] to-zinc-950"
            style={{ borderBottomColor: `${brandColor}40` }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center overflow-hidden shrink-0 bg-black/90 p-1.5 shadow-md"
                style={{
                  border: `2px solid ${brandColor}`,
                  boxShadow: `0 0 12px ${brandColor}50`,
                }}
              >
                {hasValidLogo ? (
                  <img
                    src={currentLogo!}
                    alt={nomeRistorante}
                    onError={() => setImgError(true)}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <ChefHat size={22} style={{ color: brandColor }} />
                )}
              </div>
              <div>
                <h4 className="text-sm font-black text-white leading-tight flex items-center gap-1.5">
                  <span>{maitreTitle}</span>
                  <Sparkles className="w-3.5 h-3.5" style={{ color: brandColor }} />
                </h4>
                <span className="text-[11px] font-bold flex items-center gap-1.5 mt-0.5" style={{ color: brandColor }}>
                  <span className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: brandColor }} />
                  {nomeRistorante}
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="text-zinc-400 hover:text-white font-bold text-lg w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* PULSANTI SERVIZIO RAPIDI */}
          <div
            className="p-2.5 bg-zinc-950/90 border-b border-white/5 flex gap-2 overflow-x-auto shrink-0"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            <button
              onClick={() => handleSend('Consigliami il menu perfetto per stasera')}
              className="px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap bg-white/5 hover:bg-white/15 text-zinc-200 border border-white/10 transition cursor-pointer"
            >
              🍷 Consigliami Menu
            </button>
            <button
              onClick={() => handleSend('Vorrei prenotare un tavolo')}
              className="px-3.5 py-1.5 rounded-full text-xs font-black whitespace-nowrap text-slate-950 transition shadow-md cursor-pointer"
              style={{ backgroundColor: brandColor }}
            >
              📅 Prenota Tavolo
            </button>
            <button
              onClick={() => handleSend('Avete opzioni senza glutine o celiachia?')}
              className="px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap bg-white/5 hover:bg-white/15 text-zinc-200 border border-white/10 transition cursor-pointer"
            >
              🌾 Allergeni
            </button>
          </div>

          {/* MESSAGGI CHAT CON LOGO SUL BOT */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gradient-to-b from-[#090a10] to-[#040407]">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start items-start'}`}
              >
                {/* Avatar Logo del Locale per il Maître */}
                {m.sender === 'bot' && (
                  <div
                    className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center bg-black border p-1 mt-0.5 shadow"
                    style={{ borderColor: `${brandColor}80` }}
                  >
                    {hasValidLogo ? (
                      <img src={currentLogo!} alt="Logo" className="w-full h-full object-contain" />
                    ) : (
                      <ChefHat size={14} style={{ color: brandColor }} />
                    )}
                  </div>
                )}

                <div
                  className={`max-w-[85%] p-3.5 rounded-2xl text-xs md:text-sm leading-relaxed shadow-lg ${
                    m.sender === 'user'
                      ? 'text-slate-950 font-extrabold rounded-br-none'
                      : 'bg-[#151624] text-zinc-100 border border-white/10 rounded-tl-none'
                  }`}
                  style={{
                    backgroundColor: m.sender === 'user' ? brandColor : undefined,
                  }}
                  dangerouslySetInnerHTML={{
                    __html: m.text
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      .replace(/\n/g, '<br/>')
                      .replace(/(\d{4,12})/g, '<a href="tel:$1" style="text-decoration:underline; font-weight:bold; color:#38bdf8;">$1</a>'),
                  }}
                />
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2.5">
                <div
                  className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center bg-black border p-1 shadow"
                  style={{ borderColor: `${brandColor}80` }}
                >
                  {hasValidLogo ? (
                    <img src={currentLogo!} alt="Logo" className="w-full h-full object-contain" />
                  ) : (
                    <ChefHat size={14} style={{ color: brandColor }} />
                  )}
                </div>
                <div className="bg-[#151624] border border-white/10 p-3 rounded-2xl rounded-tl-none text-xs text-zinc-400 flex items-center gap-1.5 shadow">
                  <span className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: brandColor }} />
                  <span className="w-2 h-2 rounded-full animate-bounce delay-100" style={{ backgroundColor: brandColor }} />
                  <span className="w-2 h-2 rounded-full animate-bounce delay-200" style={{ backgroundColor: brandColor }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* INPUT TESTO */}
          <div className="p-3 bg-zinc-950 border-t border-white/10 flex gap-2 shrink-0">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Scrivi al Maître..."
              className="flex-1 bg-[#151726] border border-white/10 rounded-xl px-4 py-2.5 text-xs md:text-sm text-white outline-none focus:border-amber-500 transition placeholder-zinc-500"
            />
            <button
              onClick={() => handleSend()}
              disabled={isLoading || !inputValue.trim()}
              className="px-4 py-2.5 rounded-xl font-black text-slate-950 text-xs uppercase tracking-wider transition disabled:opacity-50 cursor-pointer shadow-md"
              style={{ backgroundColor: brandColor }}
            >
              Invia
            </button>
          </div>
        </div>
      )}
    </>
  );
}
