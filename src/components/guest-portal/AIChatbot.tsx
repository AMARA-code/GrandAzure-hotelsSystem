"use client";

import { useState, useRef, useEffect } from "react";

const BOT_NAME = "Grand Azure Concierge";
const WELCOME_MSG =
  "Welcome to Grand Azure Hotels! I'm your personal concierge. I can help you with room availability, pricing, restaurants, and more. How may I assist you today?";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function AIChatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: WELCOME_MSG },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open) {
      setUnread(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    if (!open && messages[messages.length - 1]?.role === "assistant") {
      setUnread((n) => n + 1);
    }
  }, [messages]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;

    const newMessages: Message[] = [
      ...messages,
      { role: "user", content: text },
    ];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply },
      ]);
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I apologize — something went wrong on my end. Please try again or contact our front desk directly.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <>
      <style>{`
        .cbot * { box-sizing: border-box; font-family: inherit; }

        /* ── Floating bubble ── */
        /* Pastel terra card tone for the bubble */
        .cbot-bubble {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 9999;
          width: 54px;
          height: 54px;
          border-radius: 50%;
          background: #FFF4ED;
          border: 2px solid #F0EDE8;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 20px rgba(160,120,90,0.12), 0 1px 4px rgba(0,0,0,0.06);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .cbot-bubble:hover {
          transform: scale(1.06) translateY(-2px);
          box-shadow: 0 8px 28px rgba(160,120,90,0.18), 0 2px 8px rgba(0,0,0,0.08);
        }
        /* Icon in warm-700 terracotta */
        .cbot-bubble svg { width: 22px; height: 22px; color: #70503C; }

        /* Unread badge — pastel orange card tone */
        .cbot-badge {
          position: absolute;
          top: -2px; right: -2px;
          background: #E09A58;
          color: #fff;
          font-size: 9px; font-weight: 700;
          width: 18px; height: 18px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          border: 2px solid #FAFAF7;
          animation: cbotPulse 2s infinite;
        }
        @keyframes cbotPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(224,154,88,0.35); }
          50%       { box-shadow: 0 0 0 5px rgba(224,154,88,0); }
        }

        /* ── Chat window ── */
        /* warm-50 base, card border */
        .cbot-window {
          position: fixed;
          bottom: 90px;
          right: 24px;
          z-index: 9998;
          width: 344px;
          height: 500px;
          background: #FAFAF7;
          border-radius: 20px;
          border: 1px solid #E7E3DC;
          box-shadow:
            0 20px 60px rgba(90,60,40,0.10),
            0 4px 16px rgba(0,0,0,0.05),
            inset 0 1px 0 rgba(255,255,255,0.9);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          animation: cbotSlideUp 0.22s cubic-bezier(0.34,1.56,0.64,1);
        }
        @keyframes cbotSlideUp {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* ── Header ── */
        /* card-terra pastel background */
        .cbot-header {
          padding: 13px 14px 12px;
          background: linear-gradient(135deg, #FFF4ED 0%, #FFF7ED 100%);
          display: flex;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
          border-bottom: 1px solid #F0EDE8;
          position: relative;
        }
        .cbot-header::after {
          content: '';
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(168,134,102,0.2), transparent);
        }

        /* Avatar — pastel sky + soft text */
        .cbot-header-avatar {
          width: 36px; height: 36px; border-radius: 50%;
          background: linear-gradient(135deg, #F0F9FF 0%, #EFF6FF 100%);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          border: 2px solid rgba(255,255,255,0.8);
          box-shadow: 0 2px 8px rgba(90,60,40,0.08);
        }
        /* Icon warm-700 */
        .cbot-header-avatar svg { width: 17px; height: 17px; color: #70503C; }

        .cbot-header-info { flex: 1; min-width: 0; }
        /* warm-800 for name */
        .cbot-header-name {
          color: #593F31;
          font-weight: 600;
          font-size: 13.5px;
          line-height: 1.3;
          letter-spacing: 0.01em;
        }
        .cbot-header-status { display: flex; align-items: center; gap: 5px; margin-top: 2px; }
        /* Emerald-500 dot */
        .cbot-status-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: #10b981;
          flex-shrink: 0;
          box-shadow: 0 0 0 2px rgba(16,185,129,0.18);
          animation: cbotStatusPulse 3s infinite;
        }
        @keyframes cbotStatusPulse {
          0%, 100% { box-shadow: 0 0 0 2px rgba(16,185,129,0.18); }
          50%       { box-shadow: 0 0 0 4px rgba(16,185,129,0); }
        }
        /* warm-600 subtext */
        .cbot-header-sub { color: #8C6A4F; font-size: 11px; }

        /* Close button */
        .cbot-close {
          background: rgba(112,80,60,0.06);
          border: 1px solid rgba(112,80,60,0.10);
          border-radius: 8px; cursor: pointer;
          color: #A88666;
          padding: 5px;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.15s;
          flex-shrink: 0;
        }
        .cbot-close:hover {
          background: rgba(112,80,60,0.12);
          color: #593F31;
          transform: scale(1.05);
        }
        .cbot-close svg { width: 14px; height: 14px; }

        /* ── Messages area ── */
        /* warm-100 background */
        .cbot-messages {
          flex: 1; overflow-y: auto;
          padding: 14px 12px;
          display: flex; flex-direction: column; gap: 12px;
          background: #F7F4EF;
        }
        .cbot-messages::-webkit-scrollbar { width: 3px; }
        .cbot-messages::-webkit-scrollbar-track { background: transparent; }
        .cbot-messages::-webkit-scrollbar-thumb {
          background: #E7E3DC;
          border-radius: 99px;
        }

        .cbot-msg-row { display: flex; gap: 8px; align-items: flex-end; }
        .cbot-msg-row.user { flex-direction: row-reverse; }

        .cbot-msg-avatar {
          width: 28px; height: 28px; border-radius: 50%; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          font-size: 9px; font-weight: 700; letter-spacing: 0.03em;
        }
        /* Bot avatar — pastel sky */
        .cbot-msg-avatar.bot {
          background: linear-gradient(135deg, #F0F9FF, #EFF6FF);
          color: #70503C;
          border: 1px solid #E7E3DC;
          box-shadow: 0 1px 4px rgba(90,60,40,0.08);
        }
        /* User avatar — pastel purple */
        .cbot-msg-avatar.user {
          background: linear-gradient(135deg, #FDF4FF, #F5F3FF);
          color: #7c3aed;
          border: 1px solid #E7E3DC;
        }

        /* Bot bubble — pure white card */
        .cbot-bubble-msg {
          max-width: 100%;
          padding: 9px 12px;
          font-size: 13px;
          line-height: 1.65;
          white-space: pre-wrap;
          word-break: break-word;
        }
        .cbot-bubble-msg.bot {
          background: #FFFFFF;
          border: 1px solid #F0EDE8;
          border-radius: 16px 16px 16px 4px;
          color: #593F31;
          box-shadow: 0 1px 6px rgba(90,60,40,0.06);
        }
        /* User bubble — card-green pastel */
        .cbot-bubble-msg.user {
          background: linear-gradient(135deg, #F0FDF4, #ecfdf5);
          color: #3A2D20;
          border-radius: 16px 16px 4px 16px;
          border: 1px solid #d1fae5;
        }

        /* Timestamp */
        .cbot-msg-time {
          font-size: 10px;
          color: #C7AB8A;
          margin-top: 3px;
          padding: 0 2px;
          letter-spacing: 0.01em;
        }
        .cbot-msg-row.user .cbot-msg-time { text-align: right; }

        /* ── Typing indicator ── */
        .cbot-typing {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 10px 14px;
          background: #FFFFFF;
          border: 1px solid #F0EDE8;
          border-radius: 16px 16px 16px 4px;
          width: fit-content;
          box-shadow: 0 1px 6px rgba(90,60,40,0.06);
        }
        .cbot-typing span {
          width: 7px; height: 7px; border-radius: 50%;
          background: #C7AB8A;
          animation: cbotBounce 1.4s infinite ease-in-out;
        }
        .cbot-typing span:nth-child(2) { animation-delay: 0.2s; }
        .cbot-typing span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes cbotBounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40%            { transform: translateY(-6px); opacity: 1; }
        }

        /* ── Quick suggestion chips ── */
        /* card-sky pastel chips */
        .cbot-suggestions {
          display: flex; flex-wrap: wrap; gap: 5px;
          padding: 0 12px 10px;
          background: #F7F4EF;
        }
        .cbot-chip {
          background: #F0F9FF;
          border: 1px solid #bae6fd;
          border-radius: 20px;
          padding: 4px 10px;
          font-size: 11px;
          color: #0369a1;
          cursor: pointer;
          transition: all 0.15s;
          white-space: nowrap;
        }
        .cbot-chip:hover {
          background: #e0f2fe;
          border-color: #7dd3fc;
          color: #0c4a6e;
        }

        /* ── Footer / input area ── */
        .cbot-footer {
          padding: 10px;
          border-top: 1px solid #F0EDE8;
          background: #FAFAF7;
          display: flex; gap: 8px; align-items: flex-end;
          flex-shrink: 0;
        }
        /* Input — white with warm-300 border */
        .cbot-textarea {
          flex: 1; resize: none;
          border: 1.5px solid #E7E3DC;
          border-radius: 12px;
          padding: 8px 11px;
          font-size: 13px; line-height: 1.45;
          font-family: inherit; outline: none;
          max-height: 80px; min-height: 36px;
          background: #FFFFFF; color: #593F31;
          transition: border-color 150ms ease, box-shadow 150ms ease;
        }
        .cbot-textarea::placeholder { color: #C7AB8A; }
        /* Focus — card-sky accent ring */
        .cbot-textarea:focus {
          border-color: #7dd3fc;
          box-shadow: 0 0 0 3px rgba(125,211,252,0.15);
        }
        .cbot-textarea:disabled { opacity: 0.5; cursor: not-allowed; }

        /* Send button — card-green pastel */
        .cbot-send {
          width: 36px; height: 36px; border-radius: 11px;
          background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
          border: 1px solid #6ee7b7;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 2px 8px rgba(16,185,129,0.12);
          transition: all 0.15s;
        }
        .cbot-send:disabled {
          opacity: 0.35; cursor: not-allowed; box-shadow: none;
          background: #F0EDE8; border-color: #E7E3DC;
        }
        .cbot-send:not(:disabled):hover {
          transform: scale(1.06) translateY(-1px);
          box-shadow: 0 4px 14px rgba(16,185,129,0.20);
        }
        /* Send icon — emerald-600 */
        .cbot-send svg { width: 15px; height: 15px; color: #059669; }
        .cbot-send:disabled svg { color: #A88666; }

        /* ── Powered by ── */
        .cbot-powered {
          font-size: 10px; color: #C7AB8A;
          text-align: center;
          padding: 2px 0 8px;
          background: #FAFAF7;
          letter-spacing: 0.02em;
          flex-shrink: 0;
        }

        @media (max-width: 420px) {
          .cbot-window  { width: calc(100vw - 20px); right: 10px; bottom: 84px; height: 470px; }
          .cbot-bubble  { right: 14px; bottom: 14px; }
        }
      `}</style>

      <div className="cbot">
        {/* Floating bubble */}
        <button
          className="cbot-bubble"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Close chat" : "Open chat"}
        >
          {open ? (
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          )}
          {!open && unread > 0 && (
            <span className="cbot-badge">{unread > 9 ? "9+" : unread}</span>
          )}
        </button>

        {/* Chat window */}
        {open && (
          <div className="cbot-window" role="dialog" aria-label="Grand Azure Concierge Chat">

            {/* Header */}
            <div className="cbot-header">
              <div className="cbot-header-avatar">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15m-6.3-11.896c.25.023.499.05.75.082M19.8 15l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.607L5 14.5m14.8.5l-1.15 2.9a2.25 2.25 0 01-2.12 1.5H7.47a2.25 2.25 0 01-2.12-1.5L4.2 15" />
                </svg>
              </div>
              <div className="cbot-header-info">
                <div className="cbot-header-name">{BOT_NAME}</div>
                <div className="cbot-header-status">
                  <div className="cbot-status-dot" />
                  <span className="cbot-header-sub">Online · Available 24/7</span>
                </div>
              </div>
              <button
                className="cbot-close"
                onClick={() => setOpen(false)}
                aria-label="Close chat"
              >
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Messages */}
            <div className="cbot-messages">
              {messages.map((msg, i) => (
                <div key={i} className={`cbot-msg-row ${msg.role === "user" ? "user" : ""}`}>
                  <div className={`cbot-msg-avatar ${msg.role === "user" ? "user" : "bot"}`}>
                    {msg.role === "user" ? "U" : "GA"}
                  </div>
                  <div style={{ maxWidth: "80%" }}>
                    <div className={`cbot-bubble-msg ${msg.role === "user" ? "user" : "bot"}`}>
                      {msg.content}
                    </div>
                    <div className="cbot-msg-time">
                      {new Date().toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              ))}

              {loading && (
                <div className="cbot-msg-row">
                  <div className="cbot-msg-avatar bot">GA</div>
                  <div className="cbot-typing">
                    <span /><span /><span />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Quick suggestion chips — shown only at start */}
            {messages.length <= 1 && (
              <div className="cbot-suggestions">
                {[
                  "Room availability",
                  "Islamabad branch",
                  "Restaurant hours",
                  "Pricing & rates",
                ].map((chip) => (
                  <button
                    key={chip}
                    className="cbot-chip"
                    onClick={() => {
                      setInput(chip);
                      setTimeout(() => inputRef.current?.focus(), 50);
                    }}
                  >
                    {chip}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="cbot-footer">
              <textarea
                ref={inputRef}
                className="cbot-textarea"
                rows={1}
                placeholder="Ask me anything…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                disabled={loading}
              />
              <button
                className="cbot-send"
                onClick={sendMessage}
                disabled={!input.trim() || loading}
                aria-label="Send message"
              >
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>

            <div className="cbot-powered">Powered by Groq AI · Live hotel data</div>
          </div>
        )}
      </div>
    </>
  );
}