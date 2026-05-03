"use client";

import { useEffect, useMemo, useState } from "react";
import { TOPIC_LABELS } from "@/lib/questions/types";
import { useProgress } from "@/lib/store/useProgress";

const RADIUS = 52;
const STROKE = 10;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function DonutChart({ score }: { score: number }) {
  const pct = score / 100;
  const offset = CIRCUMFERENCE * (1 - pct);
  // Color based on score: green >= 80, amber >= 50, red < 50
  const color = score >= 80 ? "#22C55E" : score >= 50 ? "#F59E0B" : "#EF4444";

  return (
    <div className="relative">
      <svg width="128" height="128" viewBox="0 0 128 128">
        {/* Track */}
        <circle
          cx="64" cy="64" r={RADIUS}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={STROKE}
        />
        {/* Progress arc */}
        <circle
          cx="64" cy="64" r={RADIUS}
          fill="none"
          stroke={color}
          strokeWidth={STROKE}
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 64 64)"
          style={{ transition: "stroke-dashoffset 0.8s ease" }}
        />
      </svg>
      {/* Centered percentage */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[32px] font-bold text-white leading-none">{score}%</span>
        <span className="text-[11px] mt-1 uppercase tracking-wider" style={{ color: "#8B8FA8" }}>Ready</span>
      </div>
    </div>
  );
}

function getBarColor(pct: number) {
  if (pct >= 80) return "#22C55E";
  if (pct >= 50) return "#F59E0B";
  return "#EF4444";
}

const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

function getRecentDays(streakDays: string[]) {
  const completed = new Set(streakDays);
  const today = new Date();

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - index));
    const isoDate = date.toISOString().slice(0, 10);

    return {
      label: DAY_LABELS[index],
      done: completed.has(isoDate),
    };
  });
}

interface DashboardProps {
  stateCode: string;
  stateName: string;
  onPractice: () => void;
  onExam: () => void;
  onPracticeWeakTopic?: (topic: string) => void;
}

export default function Dashboard({ stateCode, stateName, onPractice, onExam, onPracticeWeakTopic }: DashboardProps) {
  const { progress } = useProgress(stateCode);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  const days = useMemo(() => getRecentDays(progress.streakDays), [progress.streakDays]);
  const accuracy = progress.totalAnswered > 0
    ? Math.round((progress.totalCorrect / progress.totalAnswered) * 100)
    : 0;
  const topics = Object.values(progress.topicStats)
    .map((stat) => ({
      id: stat.topic,
      name: TOPIC_LABELS[stat.topic as keyof typeof TOPIC_LABELS] ?? stat.topic,
      pct: Math.round(stat.masteryScore),
    }))
    .slice(0, 4);
  const hasProgress = progress.totalAnswered > 0;

  return (
    <div className="flex flex-col h-full overflow-y-auto dr-scroll" style={{ background: "#0A0A1B" }}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 pt-6 pb-3 flex-shrink-0">
        <span className="text-[20px] font-bold" style={{ color: "#4F8EF7" }}>DriveReady</span>
        <button className="p-2">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8B8FA8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        </button>
      </div>

      <div className="px-5 space-y-5 pb-6">
        {/* Greeting */}
        <div>
          <p className="text-[18px] font-bold text-white">Good morning, Jeevan</p>
          <span className="inline-block mt-1.5 px-3 py-1 rounded-full text-[12px] font-semibold text-white" style={{ background: "#4F8EF7" }}>
            {stateName} DMV
          </span>
        </div>

        {/* Readiness Score Card with soft blue glow */}
        <div 
          className="rounded-2xl p-5" 
          style={{ 
            background: "#12122A", 
            border: "1px solid rgba(255,255,255,0.06)",
            boxShadow: "0 0 40px rgba(79,142,247,0.08)",
          }}
        >
          <div className="flex justify-center">
            {loading ? (
              <div className="w-[128px] h-[128px] rounded-full animate-pulse" style={{ background: "rgba(255,255,255,0.08)" }} />
            ) : (
              <DonutChart score={progress.readinessScore} />
            )}
          </div>
          <p className="text-center text-[15px] font-semibold text-white mt-3">
            {loading ? "Loading progress..." : hasProgress ? "You're almost ready!" : "Start practicing to see your progress"}
          </p>
          <div className="flex gap-3 mt-4">
            <div className="flex-1 rounded-xl px-3 py-3 text-center" style={{ background: "rgba(79,142,247,0.08)", border: "1px solid rgba(79,142,247,0.15)" }}>
              <p className="text-[15px] font-bold text-white">{loading ? "..." : progress.totalAnswered}</p>
              <p className="text-[11px] mt-0.5" style={{ color: "#8B8FA8" }}>questions</p>
            </div>
            <div className="flex-1 rounded-xl px-3 py-3 text-center" style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.15)" }}>
              <p className="text-[15px] font-bold text-white">{loading ? "..." : `${accuracy}%`}</p>
              <p className="text-[11px] mt-0.5" style={{ color: "#8B8FA8" }}>accuracy</p>
            </div>
          </div>
        </div>

        {/* 7-day Streak Tracker */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[15px] font-semibold text-white">This Week</span>
            <span className="text-[13px] font-medium" style={{ color: "#4F8EF7" }}>{loading ? "..." : progress.currentStreak} day streak</span>
          </div>
          <div className="flex gap-2">
            {days.map((day, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                <div
                  className="w-[36px] h-[36px] rounded-full flex items-center justify-center transition-all"
                  style={{
                    background: day.done 
                      ? "linear-gradient(135deg, #4F8EF7 0%, #3B7DE8 100%)" 
                      : "#1E2038",
                    border: day.done ? "none" : "1.5px solid rgba(255,255,255,0.1)",
                    boxShadow: day.done ? "0 2px 8px rgba(79,142,247,0.3)" : "none",
                  }}
                >
                  {day.done && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  )}
                </div>
                <span className="text-[11px] font-medium" style={{ color: day.done ? "#4F8EF7" : "#6B6B7B" }}>{day.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Topic Mastery with color-coded bars */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[15px] font-semibold text-white">Topic Mastery</span>
            <button className="text-[13px] font-medium" style={{ color: "#4F8EF7" }}>View all</button>
          </div>
          <div className="rounded-2xl p-4 space-y-4" style={{ background: "#12122A", border: "1px solid rgba(255,255,255,0.06)" }}>
            {loading ? (
              <>
                <div className="h-9 rounded-xl animate-pulse" style={{ background: "rgba(255,255,255,0.08)" }} />
                <div className="h-9 rounded-xl animate-pulse" style={{ background: "rgba(255,255,255,0.08)" }} />
                <div className="h-9 rounded-xl animate-pulse" style={{ background: "rgba(255,255,255,0.08)" }} />
              </>
            ) : !hasProgress ? (
              <p className="text-[14px] leading-relaxed" style={{ color: "#8B8FA8" }}>Start practicing to see your progress</p>
            ) : topics.map((t) => {
              const barColor = getBarColor(t.pct);
              const needsReview = t.pct < 70;
              return (
                <button key={t.id} onClick={() => needsReview && onPracticeWeakTopic?.(t.id)} className="w-full text-left">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[14px] font-medium text-white">{t.name}</span>
                    <div className="flex items-center gap-2">
                      {needsReview && (
                        <span 
                          className="text-[10px] px-2 py-0.5 rounded-full font-semibold" 
                          style={{ 
                            background: t.pct < 50 ? "rgba(239,68,68,0.12)" : "rgba(245,158,11,0.12)", 
                            color: t.pct < 50 ? "#EF4444" : "#F59E0B" 
                          }}
                        >
                          Needs review
                        </span>
                      )}
                      <span className="text-[14px] font-bold" style={{ color: barColor }}>{t.pct}%</span>
                    </div>
                  </div>
                  <div className="h-[6px] rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                    <div
                      className="h-[6px] rounded-full transition-all duration-500"
                      style={{ width: `${t.pct}%`, background: barColor }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex gap-3 pt-1">
          <button
            onClick={onPractice}
            className="flex-1 h-[56px] rounded-2xl text-[15px] font-bold text-white flex items-center justify-center gap-2 transition-all"
            style={{ 
              background: "linear-gradient(135deg, #4F8EF7 0%, #3B7DE8 100%)",
              boxShadow: "0 4px 16px rgba(79,142,247,0.3)",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
            Practice
          </button>
          <button
            onClick={onExam}
            className="flex-1 h-[56px] rounded-2xl text-[15px] font-bold flex items-center justify-center gap-2 transition-all"
            style={{ 
              background: "#12122A",
              border: "1.5px solid rgba(255,255,255,0.1)",
              color: "#fff",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="2" width="6" height="4" rx="1" />
              <path d="M16 4h2a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
            </svg>
            Full Exam
          </button>
        </div>
      </div>
    </div>
  );
}
