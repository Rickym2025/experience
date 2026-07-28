'use client';

import { useState, useEffect, useRef } from 'react';

interface Message {
  sender: 'bot' | 'user';
  text: string;
}

interface NexusWidgetProps {
  botId: string;
  brandColor?: string;
  nomeRistorante?: string;
}

export default function NexusWidget({
  botId,
  brandColor = '#06b6d4',
  nomeRistorante = 'Ristorante',
}: NexusWidgetProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. RECUPERO O INIZIALIZZAZIONE SESSIONE PERSISTENTE
  const storageKey = `nexus_chat_${botId}`;
  const historyKey = `nexus_history_${botId}`;

  useEffect(() => {
    // Carica storico messaggi o sequenza di benvenuto
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
    const welcome: Message[] = [
      {
        sender: 'bot',
        text: `Benvenuto da **${nomeRistorante}**! 🍷\nSono il Maître Virtuale. Cosa posso fare per te stasera?`,
      },
    ];
    setMessages(welcome);
    sessionStorage.setItem(historyKey, JSON.stringify(welcome));
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // INVIO MESSAGGIO A N8N
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
      const replyText = data.response || data.output || 'Siamo a tua disposizione per assisterti.';

      const updatedMessages: Message[] = [
        ...newMessages,
        { sender: 'bot', text: replyText },
      ];
      setMessages(updatedMessages);
      sessionStorage.setItem(historyKey, JSON.stringify(updatedMessages));
    } catch (err) {
      const errorMsg: Message = {
        sender: 'bot',
        text: 'Servizio di assistenza momentaneamente non disponibile. Riprova tra poco.',
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* PULSANTE BUBBLE IN BASSO A SINISTRA SE CHIUSO */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 left-6 z-50 w-14 h-14 rounded-full bg-[#0a0a10] border-2 text-white flex items-center justify-center shadow-2xl transition-transform hover:scale-110 active:scale-95"
          style={{
            borderColor: brandColor,
            boxShadow: `0 0 20px ${brandColor}60`,
          }}
          title="Apri Maître Virtuale"
        >
          <span className="text-2xl">🍷</span>
        </button>
      )}

      {/* FINESTRA CHAT (FULLSCREEN SU MOBILE, IN BASSO A SINISTRA SU DESKTOP) */}
      {isOpen && (
        <div
          className="fixed z-50 inset-0 sm:inset-auto sm:bottom-6 sm:left-6 sm:w-[390px] sm:h-[620px] bg-[#08080d]/98 backdrop-blur-2xl border-0 sm:border-2 rounded-none sm:rounded-3xl flex flex-col overflow-hidden shadow-2xl transition-all"
          style={{
            borderColor: brandColor,
            boxShadow: `0 0 35px ${brandColor}40`,
          }}
        >
          {/* HEADER CHAT CON EFFETTO GLOW */}
          <div
            className="p-4 border-b border-white/10 flex items-center justify-between shrink-0 bg-[#0c0c14]"
            style={{ borderBottomColor: `${brandColor}40` }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-lg shadow-md shrink-0"
                style={{ backgroundColor: `${brandColor}20`, border: `1px solid ${brandColor}` }}
              >
                🍷
              </div>
              <div>
                <h4 className="text-sm font-black text-white leading-tight">
                  Maître Virtuale AI
                </h4>
                <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  {nomeRistorante}
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white font-bold text-xl px-2 py-1"
            >
              ✕
            </button>
          </div>

          {/* PULSANTI DI SERVIZIO SEMPRE IN PRIMO PIANO IN ALTO */}
          <div className="p-2.5 bg-[#050508] border-b border-white/5 flex gap-2 overflow-x-auto scrollbar-none shrink-0">
            <button
              onClick={() => handleSend('Consigliami il menu perfetto per stasera')}
              className="px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap bg-white/5 hover:bg-white/10 text-gray-200 border border-white/10 transition"
            >
              🍷 Consigliami Menu
            </button>
            <button
              onClick={() => handleSend('Vorrei prenotare un tavolo')}
              className="px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap bg-white/5 hover:bg-white/10 text-amber-400 border border-amber-500/20 transition"
            >
              📅 Prenota Tavolo
            </button>
            <button
              onClick={() => handleSend('Avete opzioni senza glutine o celiachia?')}
              className="px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap bg-white/5 hover:bg-white/10 text-gray-200 border border-white/10 transition"
            >
              🌾 Allergeni
            </button>
          </div>

          {/* MESSAGGI CONVERSAZIONE */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#030306]">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${
                  m.sender === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-[85%] p-3.5 rounded-2xl text-xs md:text-sm leading-relaxed ${
                    m.sender === 'user'
                      ? 'text-black font-semibold rounded-br-none'
                      : 'bg-[#12121c] text-gray-100 border border-white/10 rounded-bl-none'
                  }`}
                  style={{
                    backgroundColor: m.sender === 'user' ? brandColor : undefined,
                  }}
                  dangerouslySetInnerHTML={{
                    __html: m.text
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      .replace(/\n/g, '<br/>'),
                  }}
                />
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-[#12121c] border border-white/10 p-3 rounded-2xl text-xs text-gray-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce delay-100" />
                  <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce delay-200" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* INPUT TESTO IN BASSO */}
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
              className="px-4 py-2.5 rounded-xl font-black text-black text-xs uppercase tracking-wider transition disabled:opacity-50"
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
