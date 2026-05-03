"use client";

export type Tab = "home" | "practice" | "exam" | "progress";

const TABS: { id: Tab; label: string; icon: (active: boolean) => React.ReactNode }[] = [
  {
    id: "home",
    label: "Home",
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? "#4F8EF7" : "none"} stroke={active ? "#4F8EF7" : "#6B6B7B"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    id: "practice",
    label: "Practice",
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#4F8EF7" : "#6B6B7B"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
    ),
  },
  {
    id: "exam",
    label: "Exam",
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#4F8EF7" : "#6B6B7B"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="9" y="2" width="6" height="4" rx="1" /><path d="M16 4h2a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
        <path d="M12 11h4M12 16h4M8 11h.01M8 16h.01" />
      </svg>
    ),
  },
  {
    id: "progress",
    label: "Progress",
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#4F8EF7" : "#6B6B7B"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
];

interface BottomTabBarProps {
  active: Tab;
  onChange: (tab: Tab) => void;
}

export default function BottomTabBar({ active, onChange }: BottomTabBarProps) {
  return (
    <div
      className="flex-shrink-0 flex items-center justify-around px-2 pt-2.5 pb-5"
      style={{
        background: "#0D0D1A",
        borderTop: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {TABS.map((tab) => {
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className="flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl transition-all"
            style={{ minWidth: "60px" }}
          >
            {tab.icon(isActive)}
            <span
              className="text-[11px] font-semibold"
              style={{ color: isActive ? "#4F8EF7" : "#6B6B7B" }}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
