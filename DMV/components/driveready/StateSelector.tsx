"use client";

import { useState, useMemo } from "react";

const US_STATES = [
  { abbr: "AL", name: "Alabama" },
  { abbr: "AK", name: "Alaska" },
  { abbr: "AZ", name: "Arizona" },
  { abbr: "AR", name: "Arkansas" },
  { abbr: "CA", name: "California" },
  { abbr: "CO", name: "Colorado" },
  { abbr: "CT", name: "Connecticut" },
  { abbr: "DE", name: "Delaware" },
  { abbr: "FL", name: "Florida" },
  { abbr: "GA", name: "Georgia" },
  { abbr: "HI", name: "Hawaii" },
  { abbr: "ID", name: "Idaho" },
  { abbr: "IL", name: "Illinois" },
  { abbr: "IN", name: "Indiana" },
  { abbr: "IA", name: "Iowa" },
  { abbr: "KS", name: "Kansas" },
  { abbr: "KY", name: "Kentucky" },
  { abbr: "LA", name: "Louisiana" },
  { abbr: "ME", name: "Maine" },
  { abbr: "MD", name: "Maryland" },
  { abbr: "MA", name: "Massachusetts" },
  { abbr: "MI", name: "Michigan" },
  { abbr: "MN", name: "Minnesota" },
  { abbr: "MS", name: "Mississippi" },
  { abbr: "MO", name: "Missouri" },
  { abbr: "MT", name: "Montana" },
  { abbr: "NE", name: "Nebraska" },
  { abbr: "NV", name: "Nevada" },
  { abbr: "NH", name: "New Hampshire" },
  { abbr: "NJ", name: "New Jersey" },
  { abbr: "NM", name: "New Mexico" },
  { abbr: "NY", name: "New York" },
  { abbr: "NC", name: "North Carolina" },
  { abbr: "ND", name: "North Dakota" },
  { abbr: "OH", name: "Ohio" },
  { abbr: "OK", name: "Oklahoma" },
  { abbr: "OR", name: "Oregon" },
  { abbr: "PA", name: "Pennsylvania" },
  { abbr: "RI", name: "Rhode Island" },
  { abbr: "SC", name: "South Carolina" },
  { abbr: "SD", name: "South Dakota" },
  { abbr: "TN", name: "Tennessee" },
  { abbr: "TX", name: "Texas" },
  { abbr: "UT", name: "Utah" },
  { abbr: "VT", name: "Vermont" },
  { abbr: "VA", name: "Virginia" },
  { abbr: "WA", name: "Washington" },
  { abbr: "WV", name: "West Virginia" },
  { abbr: "WI", name: "Wisconsin" },
  { abbr: "WY", name: "Wyoming" },
];

interface StateSelectorProps {
  onContinue: (state: { abbr: string; name: string }) => void;
}

export default function StateSelector({ onContinue }: StateSelectorProps) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<{ abbr: string; name: string } | null>(null);
  const [focused, setFocused] = useState(false);

  const filtered = useMemo(() => {
    if (!search.trim()) return US_STATES;
    const q = search.toLowerCase();
    return US_STATES.filter(
      (s) => s.name.toLowerCase().includes(q) || s.abbr.toLowerCase().includes(q)
    );
  }, [search]);

  return (
    <div className="relative flex flex-col h-full" style={{ background: "#0A0A1B" }}>
      {/* Header */}
      <div className="pt-8 px-5 pb-4 flex-shrink-0">
        <h1 className="text-[28px] font-bold text-white leading-tight text-balance">
          Choose your state
        </h1>
        <p className="text-[15px] mt-1.5 leading-relaxed" style={{ color: "#8B8FA8" }}>
          We&apos;ll load official questions for your DMV test
        </p>

        {/* Search bar - pill shaped with blue glow on focus */}
        <div
          className="mt-4 flex items-center gap-2 px-4 rounded-full h-12 transition-all duration-200"
          style={{
            background: "#12122A",
            border: focused ? "1.5px solid #4F8EF7" : "1.5px solid rgba(255,255,255,0.08)",
            boxShadow: focused ? "0 0 0 3px rgba(79,142,247,0.25)" : "none",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8B8FA8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            className="flex-1 bg-transparent text-[15px] text-white outline-none placeholder:text-[#8B8FA8]"
            placeholder="Search state..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
          />
          {search.length > 0 && (
            <button onClick={() => setSearch("")} className="p-0.5 rounded-full">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8B8FA8" strokeWidth="2.5" strokeLinecap="round">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* State Grid - 2 columns with 80px cards */}
      <div className="flex-1 overflow-y-auto px-5 pb-32 dr-scroll">
        {filtered.length === 0 ? (
          <p className="text-center text-[14px] mt-8" style={{ color: "#8B8FA8" }}>No states found</p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map((state) => {
              const isSelected = selected?.abbr === state.abbr;
              return (
                <button
                  key={state.abbr}
                  onClick={() => setSelected(state)}
                  className="relative h-[80px] rounded-2xl flex items-center gap-3 px-4 text-left transition-all duration-150"
                  style={{
                    background: isSelected 
                      ? "linear-gradient(135deg, rgba(79,142,247,0.12) 0%, rgba(79,142,247,0.04) 100%)" 
                      : "#12122A",
                    border: isSelected
                      ? "1.5px solid #4F8EF7"
                      : "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  {/* Blue left accent bar for selected */}
                  {isSelected && (
                    <div 
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-[4px] h-[40px] rounded-r-full"
                      style={{ background: "#4F8EF7" }}
                    />
                  )}
                  <div className="flex flex-col">
                    <span className="text-[22px] font-bold text-white leading-tight">{state.abbr}</span>
                    <span className="text-[12px] mt-0.5 leading-tight" style={{ color: "#8B8FA8" }}>{state.name}</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom fade gradient */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-36 pointer-events-none"
        style={{
          background: "linear-gradient(to top, #0A0A1B 0%, #0A0A1B 50%, transparent 100%)",
        }}
      />

      {/* Continue Button - sticky at bottom */}
      <div className="absolute bottom-0 left-0 right-0 px-5 pb-6 pt-4">
        <button
          disabled={!selected}
          onClick={() => selected && onContinue(selected)}
          className="w-full h-[56px] rounded-full text-[16px] font-bold text-white transition-all duration-200"
          style={{
            background: selected 
              ? "linear-gradient(135deg, #4F8EF7 0%, #3B7DE8 100%)" 
              : "#1E2038",
            color: selected ? "#FFFFFF" : "#4A4E6A",
            cursor: selected ? "pointer" : "not-allowed",
            boxShadow: selected ? "0 4px 20px rgba(79,142,247,0.35)" : "none",
          }}
        >
          {selected ? `Continue with ${selected.name}` : "Select a state to continue"}
        </button>
      </div>
    </div>
  );
}
