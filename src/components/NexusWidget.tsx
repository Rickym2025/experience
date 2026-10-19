'use client';

import { useState, useEffect, useRef } from 'react';
import { ChefHat, Wine } from 'lucide-react';

interface Message {
  sender: 'bot' | 'user';
  text: string;
}

interface NexusWidgetProps {
  botId: string;
  brandColor?: string;
  nomeRistorante?: string;
  logoUrl?: string | null;
  ownerName?: string | null;
}

export default function NexusWidget({
  botId,
  brandColor = '#68a19b',
  nomeRistorante = 'Locanda Venezze',
  logoUrl,
  ownerName,
}: NexusWidgetProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const storageKey = `nexus_chat_${botId}`;
  const historyKey = `nexus_history_${botId}`;

  const maitreTitle = ownerName ? `Maître Virtuale di ${ownerName}` : `Maître Virtuale AI`;

  // Validazione rigorosa del logo URL (evita immagini rotte)
  const isValidLogo = logoUrl && typeof logoUrl === 'string' && logoUrl.trim().length > 5 && (logoUrl.startsWith('http') || logoUrl.startsWith('/'));

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
  }, [botId]);

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
          strutturaId: botId || 'nexus_landing',
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
      {/* BOTTONE BUBBLE FLUTTUANTE A SINISTRA (SOPRA IL PRIVILEGE CLUB) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-20 left-4 sm:left-5 z-50 w-16 h-16 rounded-full bg-[#0a0a10] border-2 text-white flex items-center justify-center shadow-2xl transition-transform hover:scale-110 active:scale-95 cursor-pointer overflow-hidden"
          style={{
            borderColor: brandColor,
            boxShadow: `0 0 25px ${brandColor}80`,
          }}
          title={maitreTitle}
        >
          {isValidLogo ? (
            <img src={logoUrl!} alt="Logo" className="w-full h-full object-cover" />
          ) : (
            <ChefHat size={26} style={{ color: brandColor }} />
          )}
        </button>
      )}

      {/* FINESTRA CHAT APERTA A SINISTRA */}
      {isOpen && (
        <div
          className="fixed z-50 inset-0 sm:inset-auto sm:bottom-20 sm:left-4 sm:w-[450px] sm:h-[640px] bg-[#08080d]/98 backdrop-blur-2xl border-0 sm:border-2 rounded-none sm:rounded-3xl flex flex-col overflow-hidden shadow-2xl transition-all resize sm:resize-both"
          style={{
            borderColor: brandColor,
            boxShadow: `0 0 35px ${brandColor}50`,
            minWidth: '340px',
            maxWidth: '700px',
            minHeight: '480px',
            maxHeight: '90vh',
          }}
        >
          {/* HEADER CHAT CON LOGO REALE */}
          <div
            className="p-4 border-b border-white/10 flex items-center justify-between shrink-0 bg-[#0c0c14]"
            style={{ borderBottomColor: `${brandColor}40` }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center overflow-hidden shrink-0 bg-black"
                style={{ backgroundColor: `${brandColor}20`, border: `2px solid ${brandColor}` }}
              >
                {isValidLogo ? (
                  <img src={logoUrl!} alt={nomeRistorante} className="w-full h-full object-cover" />
                ) : (
                  <ChefHat size={22} style={{ color: brandColor }} />
                )}
              </div>
              <div>
                <h4 className="text-sm font-black text-white leading-tight">
                  {maitreTitle}
                </h4>
                <span className="text-[11px] font-bold flex items-center gap-1.5 mt-0.5" style={{ color: brandColor }}>
                  <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: brandColor }} />
                  {nomeRistorante}
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white font-bold text-xl px-2 py-1 cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* PULSANTI SERVIZIO RAPIDI */}
          <div
            className="p-2.5 bg-[#050508] border-b border-white/5 flex gap-2 overflow-x-auto shrink-0"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            <button
              onClick={() => handleSend('Consigliami il menu perfetto per stasera')}
              className="px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap bg-white/5 hover:bg-white/10 text-gray-200 border border-white/10 transition cursor-pointer"
            >
              🍷 Consigliami Menu
            </button>
            <button
              onClick={() => handleSend('Vorrei prenotare un tavolo')}
              className="px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap text-black font-extrabold transition shadow-md cursor-pointer"
              style={{ backgroundColor: brandColor }}
            >
              📅 Prenota Tavolo
            </button>
            <button
              onClick={() => handleSend('Avete opzioni senza glutine o celiachia?')}
              className="px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap bg-white/5 hover:bg-white/10 text-gray-200 border border-white/10 transition cursor-pointer"
            >
              🌾 Allergeni
            </button>
          </div>

          {/* MESSAGGI CHAT */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#030306]">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${
                  m.sender === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-[88%] p-3.5 rounded-2xl text-xs md:text-sm leading-relaxed ${
                    m.sender === 'user'
                      ? 'text-black font-extrabold rounded-br-none'
                      : 'bg-[#12121c] text-gray-100 border border-white/10 rounded-bl-none'
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
              <div className="flex justify-start">
                <div className="bg-[#12121c] border border-white/10 p-3 rounded-2xl text-xs text-gray-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: brandColor }} />
                  <span className="w-2 h-2 rounded-full animate-bounce delay-100" style={{ backgroundColor: brandColor }} />
                  <span className="w-2 h-2 rounded-full animate-bounce delay-200" style={{ backgroundColor: brandColor }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* INPUT TESTO */}
          <div className="p-3 bg-[#0c0c14] border-t border-white/10 flex gap-2 shrink-0">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Scrivi al Maître..."
              className="flex-1 bg-[#151522] border border-white/10 rounded-xl px-4 py-2.5 text-xs md:text-sm text-white outline-none focus:border-amber-500 transition"
            />
            <button
              onClick={() => handleSend()}
              disabled={isLoading || !inputValue.trim()}
              className="px-4 py-2.5 rounded-xl font-black text-black text-xs uppercase tracking-wider transition disabled:opacity-50 cursor-pointer"
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
