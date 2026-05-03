"use client";

import { memo } from "react";
import { TOPIC_LABELS } from "@/lib/questions/types";
import { useProgress } from "@/lib/store/useProgress";

interface ProgressTrackerProps {
  stateCode: string;
  onPracticeWeakTopic: (topic: string) => void;
  onReset: () => void;
}

function getBarColor(pct: number) {
  if (pct >= 80) return "#22C55E";
  if (pct >= 50) return "#F59E0B";
  return "#EF4444";
}

function getTopicLabel(topic: string) {
  return TOPIC_LABELS[topic as keyof typeof TOPIC_LABELS] ?? topic;
}

function getRelativeTime(timestamp: number) {
  const diffMs = Date.now() - timestamp;
  const diffDays = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));

  if (diffDays === 0) return "today";
  if (diffDays === 1) return "1 day ago";
  if (diffDays < 7) return `${diffDays} days ago`;

  const diffWeeks = Math.floor(diffDays / 7);
  return diffWeeks === 1 ? "1 week ago" : `${diffWeeks} weeks ago`;
}

const TopicRow = memo(function TopicRow({
  name,
  pct,
}: {
  name: string;
  pct: number;
}) {
  const barColor = getBarColor(pct);
  const needsReview = pct < 70;

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[14px] font-medium text-white">{name}</span>
        <div className="flex items-center gap-2">
          {needsReview && (
            <span
              className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
              style={{
                background: pct < 50 ? "rgba(239,68,68,0.12)" : "rgba(245,158,11,0.12)",
                color: pct < 50 ? "#EF4444" : "#F59E0B"
              }}
            >
              Needs review
            </span>
          )}
          <span className="text-[14px] font-bold" style={{ color: barColor }}>{pct}%</span>
        </div>
      </div>
      <div className="h-[6px] rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
        <div
          className="h-[6px] rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: barColor }}
        />
      </div>
    </div>
  );
});

export default function ProgressTracker({ stateCode, onPracticeWeakTopic, onReset }: ProgressTrackerProps) {
  const { progress, reset, weakTopics } = useProgress(stateCode);
  const accuracy = progress.totalAnswered > 0
    ? Math.round((progress.totalCorrect / progress.totalAnswered) * 100)
    : 0;
  const stats = [
    { value: progress.totalAnswered.toString(), label: "Questions" },
    { value: `${accuracy}%`, label: "Accuracy" },
    { value: progress.currentStreak.toString(), label: "Day Streak" },
  ];
  const examHistory = [...progress.examHistory]
    .sort((a, b) => b.date - a.date)
    .slice(0, 5);
  const topics = Object.values(progress.topicStats)
    .map((t) => ({
      id: t.topic,
      name: getTopicLabel(t.topic),
      pct: Math.round(t.masteryScore),
    }))
    .sort((a, b) => a.pct - b.pct);

  function handleReset() {
    if (!window.confirm("Reset all DriveReady progress for this state?")) {
      return;
    }

    reset();
    onReset();
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto dr-scroll" style={{ background: "#0A0A1B" }}>
      <div className="px-5 pt-6 pb-6 space-y-5">
        {/* Heading */}
        <div>
          <h2 className="text-[22px] font-bold text-white">Your Progress</h2>
          <p className="text-[14px] mt-0.5" style={{ color: "#8B8FA8" }}>{stateCode} DMV</p>
        </div>

        {/* Stats row - 3 column grid */}
        <div className="grid grid-cols-3 gap-3">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-2xl p-4 text-center"
              style={{ background: "#12122A", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <p className="text-[24px] font-bold text-white">{s.value}</p>
              <p className="text-[11px] mt-0.5 uppercase tracking-wide" style={{ color: "#8B8FA8" }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Exam History with colored borders */}
        <div>
          <p className="text-[16px] font-bold text-white mb-3">Exam History</p>
          <div className="space-y-2.5">
            {examHistory.length === 0 ? (
              <div
                className="rounded-2xl px-4 py-4"
                style={{
                  background: "#12122A",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <p className="text-[14px] font-bold text-white">No exams taken yet. Start your first full exam!</p>
              </div>
            ) : examHistory.map((e) => {
              const pct = Math.round((e.score / e.total) * 100);

              return (
                <div
                  key={e.id}
                  className="rounded-2xl px-4 py-4 flex items-center justify-between"
                  style={{
                    background: "#12122A",
                    border: "1px solid rgba(255,255,255,0.06)",
                    borderLeft: `4px solid ${e.passed ? "#22C55E" : "#EF4444"}`,
                  }}
                >
                  <div>
                    <p className="text-[14px] font-bold text-white">Practice Exam</p>
                    <p className="text-[12px] mt-0.5" style={{ color: "#8B8FA8" }}>
                      {e.score}/{e.total} - {pct}% - {getRelativeTime(e.date)}
                    </p>
                  </div>
                  <span
                    className="text-[11px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wide"
                    style={{
                      background: e.passed ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)",
                      color: e.passed ? "#22C55E" : "#EF4444",
                    }}
                  >
                    {e.passed ? "Passed" : "Failed"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Topic Mastery with color-coded bars */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[16px] font-bold text-white">Topic Mastery</p>
            <span className="text-[12px]" style={{ color: "#8B8FA8" }}>Weak topics highlighted</span>
          </div>
          <div className="rounded-2xl p-4 space-y-4" style={{ background: "#12122A", border: "1px solid rgba(255,255,255,0.06)" }}>
            {topics.map((t) => (
              <TopicRow key={t.id} name={t.name} pct={t.pct} />
            ))}
          </div>
        </div>

        {/* Weak Topics with Practice buttons */}
        <div>
          <p className="text-[16px] font-bold text-white mb-3">Weak Topics</p>
          <div className="space-y-2.5">
            {weakTopics.length === 0 ? (
              <div
                className="rounded-2xl px-4 py-4 flex items-center justify-between"
                style={{
                  background: "#12122A",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderLeft: "4px solid #22C55E",
                }}
              >
                <div>
                  <p className="text-[14px] font-bold text-white">All topics looking strong! Keep it up.</p>
                </div>
              </div>
            ) : weakTopics.map((t) => (
              <div
                key={t.topic}
                className="rounded-2xl px-4 py-4 flex items-center justify-between"
                style={{
                  background: "#12122A",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderLeft: "4px solid #EF4444",
                }}
              >
                <div>
                  <p className="text-[14px] font-bold text-white">{getTopicLabel(t.topic)}</p>
                  <p className="text-[12px] mt-0.5" style={{ color: "#8B8FA8" }}>{Math.round(t.masteryScore)}% mastery</p>
                </div>
                <button
                  onClick={() => onPracticeWeakTopic(t.topic)}
                  className="px-4 py-2 rounded-full text-[13px] font-bold text-white transition-all"
                  style={{
                    background: "linear-gradient(135deg, #4F8EF7 0%, #3B7DE8 100%)",
                    boxShadow: "0 2px 8px rgba(79,142,247,0.25)",
                  }}
                >
                  Practice now
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Reset */}
        <div className="text-center pt-3 pb-2">
          <button onClick={handleReset} className="text-[13px] font-semibold transition-colors hover:opacity-80" style={{ color: "#EF4444" }}>
            Reset all progress
          </button>
        </div>
      </div>
    </div>
  );
}
