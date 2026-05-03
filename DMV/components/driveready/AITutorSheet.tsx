"use client";

import { useState, useRef, useEffect } from "react";
import { useTutor } from "@/lib/ai/useTutor";
import type { Question } from "@/lib/questions/types";

interface AITutorSheetProps {
  onClose: () => void;
  currentQuestion?: Question;
}

export default function AITutorSheet({ onClose, currentQuestion }: AITutorSheetProps) {
  const { messages, sendMessage, isLoading, isOnline } = useTutor(currentQuestion);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  function handleSend() {
    const trimmed = input.trim();
    if (!trimmed) return;
    sendMessage(trimmed);
    setInput("");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") handleSend();
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="absolute inset-0 z-40"
        style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(2px)" }}
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className="absolute bottom-0 left-0 right-0 z-50 flex flex-col"
        style={{
          height: "80%",
          background: "#12122A",
          borderRadius: "24px 24px 0 0",
          boxShadow: "0 -8px 40px rgba(0,0,0,0.6)",
        }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div
            className="w-10 h-1 rounded-full"
            style={{ background: "rgba(255,255,255,0.15)" }}
          />
        </div>

        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-3 flex-shrink-0"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
        >
          <div className="flex items-center gap-3">
            {/* Robot icon */}
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(79,142,247,0.15)" }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <rect x="6" y="8" width="12" height="10" rx="2" stroke="#4F8EF7" strokeWidth="1.8" />
                <path d="M9 12h.01M15 12h.01" stroke="#4F8EF7" strokeWidth="2" strokeLinecap="round" />
                <path d="M9 16h6" stroke="#4F8EF7" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M12 8V5" stroke="#4F8EF7" strokeWidth="1.8" strokeLinecap="round" />
                <circle cx="12" cy="4" r="1.2" fill="#4F8EF7" />
                <path d="M6 12H4M20 12h-2" stroke="#4F8EF7" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <p className="text-[16px] font-bold text-white leading-none">AI Tutor</p>
              <p className="text-[11px] mt-0.5" style={{ color: isOnline === false ? "#F59E0B" : "#22C55E" }}>
                {isOnline === false ? "Offline" : "Online"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-all"
            style={{ background: "rgba(255,255,255,0.07)" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8B8FA8" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {isOnline === false && (
          <div className="px-4 py-3 flex-shrink-0" style={{ background: "rgba(245,158,11,0.08)", borderBottom: "1px solid rgba(245,158,11,0.14)" }}>
            <p className="text-[13px] font-semibold" style={{ color: "#F59E0B" }}>
              Ollama offline - run 'ollama serve' to enable AI
            </p>
          </div>
        )}

        {/* Chat area */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto dr-scroll px-4 py-4 space-y-4"
        >
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-end gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
            >
              {/* Robot avatar for AI */}
              {msg.role === "ai" && (
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mb-0.5"
                  style={{ background: "rgba(79,142,247,0.15)", border: "1px solid rgba(79,142,247,0.2)" }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                    <rect x="6" y="8" width="12" height="10" rx="2" stroke="#4F8EF7" strokeWidth="2" />
                    <path d="M9 12h.01M15 12h.01" stroke="#4F8EF7" strokeWidth="2" strokeLinecap="round" />
                    <path d="M12 8V5" stroke="#4F8EF7" strokeWidth="2" strokeLinecap="round" />
                    <circle cx="12" cy="4" r="1.2" fill="#4F8EF7" />
                  </svg>
                </div>
              )}

              <div
                className="max-w-[76%] px-4 py-3 text-[14px] leading-relaxed"
                style={{
                  background:
                    msg.role === "user"
                      ? "linear-gradient(135deg, #4F8EF7 0%, #3B7DE8 100%)"
                      : "#1E1E3F",
                  color: "#fff",
                  borderRadius:
                    msg.role === "user"
                      ? "18px 18px 4px 18px"
                      : "18px 18px 18px 4px",
                  boxShadow:
                    msg.role === "user"
                      ? "0 2px 12px rgba(79,142,247,0.3)"
                      : "none",
                  border:
                    msg.role === "ai"
                      ? "1px solid rgba(255,255,255,0.06)"
                      : "none",
                }}
              >
                {msg.text}
                {msg.isStreaming && (
                  <span className="inline-flex items-center gap-1 ml-1 align-middle">
                    <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "rgba(255,255,255,0.75)" }} />
                    <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "rgba(255,255,255,0.6)", animationDelay: "120ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "rgba(255,255,255,0.45)", animationDelay: "240ms" }} />
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Input row */}
        <div
          className="flex items-center gap-2.5 px-4 py-3 flex-shrink-0"
          style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about this question..."
            disabled={isLoading}
            className="flex-1 h-[44px] px-4 text-[14px] text-white outline-none transition-all"
            style={{
              background: "#1E1E3F",
              border: "1.5px solid rgba(255,255,255,0.08)",
              borderRadius: "22px",
              color: "#fff",
            }}
          />
          <button
            onClick={handleSend}
            disabled={isLoading}
            className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 transition-all active:scale-95"
            style={{
              background:
                input.trim()
                  ? "linear-gradient(135deg, #4F8EF7 0%, #3B7DE8 100%)"
                  : "rgba(79,142,247,0.25)",
              boxShadow: input.trim()
                ? "0 2px 12px rgba(79,142,247,0.35)"
                : "none",
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke={input.trim() ? "#fff" : "#4F8EF7"}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Powered by label */}
        <div className="pb-5 text-center flex-shrink-0">
          <p className="text-[11px]" style={{ color: "#8B8FA8" }}>
            Powered by Ollama
          </p>
        </div>
      </div>
    </>
  );
}
