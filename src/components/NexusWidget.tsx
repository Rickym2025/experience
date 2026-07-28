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
      {/* BOTTONE BUBBLE FLUTTUANTE SE CHIUSO */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 left-6 z-50 w-16 h-16 rounded-full bg-[#0a0a10] border-2 text-white flex items-center justify-center shadow-2xl transition-transform hover:scale-110 active:scale-95"
          style={{
            borderColor: brandColor,
            boxShadow: `0 0 25px ${brandColor}80`,
          }}
          title={maitreTitle}
        >
          {logoUrl ? (
            <img src={logoUrl} alt="Logo" className="w-10 h-10 object-contain rounded-full" />
          ) : (
            <span className="text-2xl">🍷</span>
          )}
        </button>
      )}

      {/* FINESTRA CHAT MAÎTRE VIRTUALE */}
      {isOpen && (
        <div
          className="fixed z-50 inset-0 sm:inset-auto sm:bottom-6 sm:left-6 sm:w-[400px] sm:h-[630px] bg-[#08080d]/98 backdrop-blur-2xl border-0 sm:border-2 rounded-none sm:rounded-3xl flex flex-col overflow-hidden shadow-2xl transition-all"
          style={{
            borderColor: brandColor,
            boxShadow: `0 0 35px ${brandColor}50`,
          }}
        >
          {/* HEADER CHAT CON LOGO VERO ED INTESTAZIONE PERSONALIZZATA */}
          <div
            className="p-4 border-b border-white/10 flex items-center justify-between shrink-0 bg-[#0c0c14]"
            style={{ borderBottomColor: `${brandColor}40` }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center overflow-hidden shrink-0"
                style={{ backgroundColor: `${brandColor}20`, border: `2px solid ${brandColor}` }}
              >
                {logoUrl ? (
                  <img src={logoUrl} alt={nomeRistorante} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xl">🍷</span>
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
              className="text-gray-400 hover:text-white font-bold text-xl px-2 py-1"
            >
              ✕
            </button>
          </div>

          {/* PULSANTI SERVIZIO SEMPRE IN PRIMO PIANO IN ALTO */}
          <div className="p-2.5 bg-[#050508] border-b border-white/5 flex gap-2 overflow-x-auto scrollbar-none shrink-0">
            <button
              onClick={() => handleSend('Consigliami il menu perfetto per stasera')}
              className="px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap bg-white/5 hover:bg-white/10 text-gray-200 border border-white/10 transition"
            >
              🍷 Consigliami Menu
            </button>
            <button
              onClick={() => handleSend('Vorrei prenotare un tavolo')}
              className="px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap text-black font-extrabold transition shadow-md"
              style={{ backgroundColor: brandColor }}
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
                  className={`max-w-[85%] p-3.5 rounded-2xl text-xs md:text-sm leading-relaxed ${
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
                      .replace(/\n/g, '<br/>'),
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
