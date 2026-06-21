import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { chatAPI } from '../utils/api';
import './ChatWidget.css';

const CHAT_ROUTE_PATTERN = /^\/(employer-dashboard|employer\/|job-seeker)/;

function isChatRoute(pathname) {
  return CHAT_ROUTE_PATTERN.test(pathname);
}

function ChatIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m22 2-7 20-4-9-9-4Z" />
      <path d="M22 2 11 13" />
    </svg>
  );
}

function BotAvatar() {
  return (
    <div className="chat-avatar chat-avatar--bot" aria-hidden="true">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7v1h-2v-1a5 5 0 0 0-5-5h-4a5 5 0 0 0-5 5v1H3v-1a7 7 0 0 1 7-7h1V5.73A2 2 0 0 1 12 2zm-3 13a3 3 0 0 0 3 3 3 3 0 0 0 3-3H9zm9 1v2H6v-2h12z" />
      </svg>
    </div>
  );
}

function TypingIndicator({ label }) {
  return (
    <div className="chat-message chat-message--assistant" role="status" aria-live="polite">
      <BotAvatar />
      <div className="chat-bubble chat-bubble--typing">
        <span className="chat-typing-label">{label}</span>
        <span className="chat-typing-dots" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
      </div>
    </div>
  );
}

function formatMessageContent(text) {
  return text.split('\n').map((line, index, arr) => (
    <span key={index}>
      {line}
      {index < arr.length - 1 && <br />}
    </span>
  ));
}

function ChatWidget() {
  const { pathname } = useLocation();
  const { lang, page } = useLanguage();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [userContext, setUserContext] = useState(null);
  const [initialized, setInitialized] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const getWelcomeMessage = useCallback((ctx) => {
    if (!ctx?.user) return page.chatWelcomeGuest;
    const name = ctx.user.name.split(' ')[0];
    if (ctx.user.role === 'employer') {
      return page.chatWelcomeEmployer.replace('{name}', name);
    }
    return page.chatWelcomeSeeker.replace('{name}', name);
  }, [page]);

  const getSuggestions = useCallback((ctx) => {
    if (!ctx?.user) return page.chatSuggestionsGuest;
    if (ctx.user.role === 'employer') return page.chatSuggestionsEmployer;
    return page.chatSuggestionsSeeker;
  }, [page]);

  useEffect(() => {
    if (!open || initialized) return;

    let cancelled = false;
    chatAPI.context()
      .then((ctx) => {
        if (cancelled) return;
        setUserContext(ctx);
        setMessages([{ id: 'welcome', role: 'assistant', content: getWelcomeMessage(ctx) }]);
        setInitialized(true);
      })
      .catch(() => {
        if (cancelled) return;
        setMessages([{ id: 'welcome', role: 'assistant', content: page.chatWelcomeGuest }]);
        setInitialized(true);
      });

    return () => { cancelled = true; };
  }, [open, initialized, getWelcomeMessage, page.chatWelcomeGuest]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [open]);

  const sendMessage = async (text) => {
    const trimmed = text.trim();
    if (!trimmed || isTyping) return;

    const userMsg = { id: `u-${Date.now()}`, role: 'user', content: trimmed };
    setMessages((prev) => [...prev, userMsg]);

    // Clear input immediately and reset height so it returns right away
    setInput('');
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }

    setIsTyping(true);


    const history = [...messages, userMsg]
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .slice(-10)
      .map((m) => ({ role: m.role, content: m.content }));

    try {
      const result = await chatAPI.send({ message: trimmed, history, lang });
      const reply = result.reply || page.chatError;
      setMessages((prev) => [
        ...prev,
        { id: `a-${Date.now()}`, role: 'assistant', content: reply },
      ]);
    } catch (err) {

      const fallbackError =
          lang === 'sw'
          ? 'Makosa ya mtandao: Siwezi kufikia AI. Tafadhali jaribu tena sasa hivi.'
          : 'Network error: I can\'t reach the AI service.';

      const msg = err?.message ? String(err.message) : '';
      setMessages((prev) => [
        ...prev,
        { id: `e-${Date.now()}`, role: 'assistant', content: fallbackError + (msg ? ` (${msg})` : '') },
      ]);
    } finally {
      setIsTyping(false);
      // Reset textarea height back to default after submit/reply
      if (inputRef.current) {
        inputRef.current.style.height = 'auto';
      }
    }
  };


  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  const suggestions = getSuggestions(userContext);

  if (!isChatRoute(pathname)) {
    return null;
  }

  return (
    <div className={`chat-widget ${open ? 'chat-widget--open' : ''}`}>
      <button
        type="button"
        className="chat-fab"
        onClick={() => setOpen((prev) => !prev)}
        aria-label={open ? page.chatClose : page.chatOpen}
        aria-expanded={open}
      >
        {open ? <CloseIcon /> : <ChatIcon />}
      </button>

      {open && (
        <div className="chat-panel" role="dialog" aria-label={page.chatTitle}>
          <header className="chat-header">
            <div className="chat-header-info">
              <div className="chat-header-avatar">
                <BotAvatar />
              </div>
              <div>
                <h2 className="chat-header-title">{page.chatTitle}</h2>
                <p className="chat-header-subtitle">{page.chatSubtitle}</p>
              </div>
            </div>
            <button
              type="button"
              className="chat-close-btn"
              onClick={() => setOpen(false)}
              aria-label={page.chatClose}
            >
              <CloseIcon />
            </button>
          </header>

          <div className="chat-messages">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`chat-message chat-message--${msg.role === 'user' ? 'user' : 'assistant'}`}
              >
                {msg.role === 'assistant' && <BotAvatar />}
                <div className={`chat-bubble chat-bubble--${msg.role}`}>
                  {formatMessageContent(msg.content)}
                </div>
              </div>
            ))}

            {isTyping && <TypingIndicator label={page.chatTyping} />}

            {messages.length === 1 && !isTyping && (
              <div className="chat-suggestions">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    className="chat-suggestion-chip"
                    onClick={() => sendMessage(suggestion)}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <form className="chat-input-form" onSubmit={handleSubmit}>
            <textarea
              ref={inputRef}
              className="chat-input"
              placeholder={page.chatPlaceholder}
              value={input}
              rows={1}
              onChange={(e) => {
                setInput(e.target.value);
                // auto-grow (same max as CSS)
                e.target.style.height = 'auto';
                e.target.style.height = `${Math.min(e.target.scrollHeight, 140)}px`;
              }}
              disabled={isTyping}
              maxLength={2000}
              autoComplete="off"
            />
            <button
              type="submit"
              className="chat-send-btn"
              disabled={!input.trim() || isTyping}
              aria-label={page.chatSend}
            >
              <SendIcon />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default ChatWidget;
