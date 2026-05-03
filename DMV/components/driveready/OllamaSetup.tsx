"use client";

interface OllamaSetupProps {
  onDismiss: () => void;
}

export default function OllamaSetup({ onDismiss }: OllamaSetupProps) {
  return (
    <div
      className="mx-4 mt-3 rounded-xl px-4 py-3 flex items-start gap-3"
      style={{
        background: "#12122A",
        border: "1px solid rgba(255,255,255,0.07)",
        borderLeft: "4px solid #F59E0B",
      }}
    >
      <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "rgba(245,158,11,0.12)" }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <path d="M12 9v4" />
          <path d="M12 17h.01" />
        </svg>
      </div>
      <div className="flex-1">
        <p className="text-[14px] font-bold text-white leading-tight">AI Tutor offline</p>
        <p className="text-[13px] mt-1 leading-relaxed" style={{ color: "#8B8FA8" }}>
          To enable: open terminal and run 'ollama serve'
        </p>
        <p className="text-[13px] mt-0.5 leading-relaxed" style={{ color: "#8B8FA8" }}>
          Also run: ollama pull llama3.2
        </p>
      </div>
      <button
        onClick={onDismiss}
        className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
        style={{ background: "rgba(255,255,255,0.07)" }}
        aria-label="Dismiss Ollama setup"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8B8FA8" strokeWidth="2.5" strokeLinecap="round">
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
