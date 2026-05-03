"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import AIErrorBoundary from "./AIErrorBoundary";
import AITutorSheet from "./AITutorSheet";
import { getExamQuestions } from "@/lib/questions";
import { TOPIC_LABELS } from "@/lib/questions/types";
import type { Question } from "@/lib/questions/types";
import { useProgress } from "@/lib/store/useProgress";
import type { ExamResult } from "@/lib/store/types";

interface ExamModeProps {
  stateCode: string;
  onComplete?: (result: ExamResult) => void;
}

const LETTERS = ["A", "B", "C", "D"];
const EXAM_COUNT = 40;
const PASS_SCORE = 32;
const EXAM_SECONDS = 25 * 60;

function getTopicLabel(topic: string) {
  return TOPIC_LABELS[topic as keyof typeof TOPIC_LABELS] ?? topic;
}

function getPillStyle(n: number, current: number, flaggedSet: Set<number>, answered: boolean) {
  if (flaggedSet.has(n - 1)) return { bg: "#F59E0B", color: "#fff", border: "none" };
  if (answered) return { bg: "#4F8EF7", color: "#fff", border: "none" };
  if (n === current) return { bg: "#FFFFFF", color: "#0A0A1B", border: "none" };
  return { bg: "transparent", color: "#6B6B7B", border: "1.5px solid rgba(255,255,255,0.12)" };
}

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
}

function ResultsScreen({
  questions,
  answers,
  result,
  onTryAgain,
  onPracticeWeakTopics,
}: {
  questions: Question[];
  answers: Record<number, number>;
  result: ExamResult;
  onTryAgain: () => void;
  onPracticeWeakTopics: () => void;
}) {
  const wrongQuestions = questions
    .map((question, index) => ({ question, index, selected: answers[index] }))
    .filter(({ question, selected }) => selected !== question.correctIndex);
  const minutesTaken = Math.floor(result.timeTaken / 60);
  const secondsTaken = result.timeTaken % 60;

  return (
    <div className="flex flex-col h-full overflow-y-auto dr-scroll" style={{ background: "#0A0A1B" }}>
      <div className="px-5 pt-6 pb-6 space-y-5">
        <div className="text-center rounded-2xl p-5" style={{ background: "#12122A", border: "1px solid rgba(255,255,255,0.06)" }}>
          <p className="text-[12px] font-bold uppercase tracking-wide" style={{ color: result.passed ? "#22C55E" : "#EF4444" }}>
            {result.passed ? "PASS" : "FAIL"}
          </p>
          <p className="text-[36px] font-bold text-white leading-none mt-2">
            {result.score}/{result.total}
          </p>
          <p className="text-[13px] mt-2" style={{ color: "#8B8FA8" }}>
            Time taken: {minutesTaken}m {secondsTaken}s
          </p>
        </div>

        <div>
          <p className="text-[16px] font-bold text-white mb-3">Topic Breakdown</p>
          <div className="rounded-2xl p-4 space-y-3" style={{ background: "#12122A", border: "1px solid rgba(255,255,255,0.06)" }}>
            {Object.entries(result.topicBreakdown).map(([topic, stats]) => {
              const pct = Math.round((stats.correct / stats.total) * 100);
              const color = pct >= 80 ? "#22C55E" : pct >= 50 ? "#F59E0B" : "#EF4444";

              return (
                <div key={topic} className="flex items-center justify-between">
                  <span className="text-[14px] font-medium text-white">{getTopicLabel(topic)}</span>
                  <span className="text-[14px] font-bold" style={{ color }}>{stats.correct}/{stats.total}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <p className="text-[16px] font-bold text-white mb-3">Review wrong answers</p>
          <div className="space-y-2.5">
            {wrongQuestions.length === 0 ? (
              <div className="rounded-2xl px-4 py-4" style={{ background: "#12122A", border: "1px solid rgba(255,255,255,0.06)" }}>
                <p className="text-[14px] font-bold text-white">Perfect score</p>
                <p className="text-[12px] mt-0.5" style={{ color: "#8B8FA8" }}>No wrong answers to review.</p>
              </div>
            ) : wrongQuestions.map(({ question, index, selected }) => (
              <div key={question.id} className="rounded-2xl px-4 py-4" style={{ background: "#12122A", border: "1px solid rgba(255,255,255,0.06)", borderLeft: "4px solid #EF4444" }}>
                <p className="text-[13px] font-semibold mb-1" style={{ color: "#8B8FA8" }}>Question {index + 1}</p>
                <p className="text-[14px] font-bold text-white leading-snug">{question.question}</p>
                <p className="text-[12px] mt-2" style={{ color: "#EF4444" }}>Your answer: {selected === undefined ? "Not answered" : question.options[selected]}</p>
                <p className="text-[12px] mt-1" style={{ color: "#22C55E" }}>Correct: {question.options[question.correctIndex]}</p>
                <p className="text-[12px] leading-relaxed mt-2" style={{ color: "#B8B8C8" }}>{question.explanation}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-1">
          <button
            onClick={onTryAgain}
            className="flex-1 h-[52px] rounded-xl text-[15px] font-bold text-white"
            style={{ background: "linear-gradient(135deg, #4F8EF7 0%, #3B7DE8 100%)", boxShadow: "0 4px 16px rgba(79,142,247,0.3)" }}
          >
            Try again
          </button>
          <button
            onClick={onPracticeWeakTopics}
            className="flex-1 h-[52px] rounded-xl text-[15px] font-bold"
            style={{ border: "1.5px solid rgba(255,255,255,0.12)", color: "#fff", background: "#12122A" }}
          >
            Practice weak topics
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ExamMode({ stateCode, onComplete }: ExamModeProps) {
  const { submitExam } = useProgress(stateCode);
  const [examSeed, setExamSeed] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [flagged, setFlagged] = useState<Set<number>>(new Set());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [examStartTime, setExamStartTime] = useState(Date.now());
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<ExamResult | null>(null);
  const [timeLeft, setTimeLeft] = useState(EXAM_SECONDS);
  const [tutorOpen, setTutorOpen] = useState(false);
  const questions = useMemo(() => getExamQuestions(stateCode, EXAM_COUNT), [stateCode, examSeed]);

  useEffect(() => {
    setAnswers({});
    setFlagged(new Set());
    setCurrentIndex(0);
    setExamStartTime(Date.now());
    setSubmitted(false);
    setResult(null);
    setTimeLeft(EXAM_SECONDS);
  }, [stateCode, examSeed]);

  useEffect(() => {
    if (submitted) return;

    const timer = setInterval(() => {
      setTimeLeft((t) => (t > 0 ? t - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [submitted]);

  const currentQuestion = questions[currentIndex];
  const selected = answers[currentIndex] ?? null;
  const flaggedCurrent = flagged.has(currentIndex);
  const minutes = Math.floor(timeLeft / 60);
  const timeStr = formatTime(timeLeft);
  const timeColor = minutes >= 10 ? "#22C55E" : minutes >= 5 ? "#F59E0B" : "#EF4444";
  const isLowTime = minutes < 5;

  const submitCurrentExam = () => {
    const score = questions.reduce((total, question, index) => {
      return total + (answers[index] === question.correctIndex ? 1 : 0);
    }, 0);
    const topicBreakdown = questions.reduce<Record<string, { correct: number; total: number }>>((breakdown, question, index) => {
      const current = breakdown[question.topic] ?? { correct: 0, total: 0 };
      breakdown[question.topic] = {
        correct: current.correct + (answers[index] === question.correctIndex ? 1 : 0),
        total: current.total + 1,
      };
      return breakdown;
    }, {});
    const examResult: Omit<ExamResult, "id"> = {
      stateCode,
      date: Date.now(),
      score,
      total: questions.length,
      passed: score >= Math.ceil(questions.length * 0.8),
      topicBreakdown,
      timeTaken: Math.max(1, Math.round((Date.now() - examStartTime) / 1000)),
    };
    const updatedProgress = submitExam(examResult);
    const savedResult = updatedProgress.examHistory[updatedProgress.examHistory.length - 1];

    setResult(savedResult);
    setSubmitted(true);
    toast.success(`Exam complete! Score: ${score}/${questions.length}`);
    onComplete?.(savedResult);
  };

  useEffect(() => {
    if (timeLeft === 0 && !submitted && questions.length > 0) {
      submitCurrentExam();
    }
  }, [timeLeft, submitted, questions.length]);

  const visiblePills = useMemo(() => {
    const total = questions.length;
    if (total <= 15) return Array.from({ length: total }, (_, i) => i + 1);

    const start = Math.min(Math.max(currentIndex - 7, 0), total - 15);
    return Array.from({ length: 15 }, (_, i) => start + i + 1);
  }, [currentIndex, questions.length]);

  function handleTryAgain() {
    setExamSeed((seed) => seed + 1);
  }

  if (submitted && result) {
    return (
      <ResultsScreen
        questions={questions}
        answers={answers}
        result={result}
        onTryAgain={handleTryAgain}
        onPracticeWeakTopics={() => onComplete?.(result)}
      />
    );
  }

  if (!currentQuestion) {
    return (
      <div className="flex flex-col h-full relative" style={{ background: "#0A0A1B" }}>
        <div className="flex-1 flex items-center justify-center px-5 text-center">
          <p className="text-[15px]" style={{ color: "#8B8FA8" }}>No exam questions available for this state yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full relative" style={{ background: "#0A0A1B" }}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 pt-6 pb-2.5 flex-shrink-0">
        <span className="text-[16px] font-bold text-white">DMV Practice Exam</span>
        <div
          className="flex items-center gap-1.5"
          style={{ animation: isLowTime ? "pulse 1s infinite" : "none" }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={timeColor} strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
          </svg>
          <span
            className="text-[15px] font-mono font-bold tabular-nums"
            style={{ color: timeColor }}
          >
            {timeStr}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="px-4 flex-shrink-0 mb-2">
        <div className="h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
          <div
            className="h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%`, background: "#4F8EF7" }}
          />
        </div>
      </div>

      {/* Exam info row */}
      <div className="flex items-center justify-between px-4 pb-3 flex-shrink-0">
        <span className="text-[13px] font-medium" style={{ color: "#8B8FA8" }}>
          Question {currentIndex + 1} of {questions.length}
        </span>
        <span className="text-[13px] font-medium" style={{ color: "#8B8FA8" }}>
          Pass: {PASS_SCORE}/{EXAM_COUNT} (80%)
        </span>
      </div>

      {/* Scrollable */}
      <div className="flex-1 overflow-y-auto dr-scroll px-4 space-y-3">
        {/* Question card with bookmark toggle */}
        <div className="rounded-2xl p-5 relative" style={{ background: "#12122A", border: "1px solid rgba(255,255,255,0.06)" }}>
          <button
            onClick={() => {
              setFlagged((prev) => {
                const next = new Set(prev);
                if (next.has(currentIndex)) next.delete(currentIndex);
                else next.add(currentIndex);
                return next;
              });
            }}
            className="absolute top-4 right-4 p-1.5 rounded-lg transition-all"
            style={{ background: flaggedCurrent ? "rgba(245,158,11,0.15)" : "transparent" }}
          >
            {flaggedCurrent ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#F59E0B" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B6B7B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
              </svg>
            )}
          </button>
          <p className="text-[18px] font-bold text-white leading-relaxed pr-10">
            {currentQuestion.question}
          </p>
        </div>

        {/* Options - no feedback shown in exam mode */}
        {currentQuestion.options.map((option, i) => {
          const isSelected = selected === i;
          return (
            <button
              key={`${currentQuestion.id}_${LETTERS[i]}`}
              onClick={() => setAnswers((prev) => ({ ...prev, [currentIndex]: i }))}
              className="w-full flex items-center gap-3 px-4 rounded-2xl text-left transition-all"
              style={{
                background: isSelected ? "rgba(79,142,247,0.1)" : "#12122A",
                border: isSelected ? "1.5px solid #4F8EF7" : "1.5px solid rgba(255,255,255,0.06)",
                minHeight: "60px",
              }}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-[14px] font-bold flex-shrink-0 transition-all"
                style={{
                  background: isSelected ? "#4F8EF7" : "transparent",
                  border: isSelected ? "none" : "1.5px solid rgba(255,255,255,0.15)",
                  color: isSelected ? "#fff" : "#8B8FA8",
                }}
              >
                {LETTERS[i]}
              </div>
              <span className="text-[15px] text-white flex-1 leading-snug py-3">{option}</span>
            </button>
          );
        })}

        {/* Question navigation - horizontal pill strip */}
        <div className="pt-2">
          <p className="text-[13px] mb-2.5 font-semibold" style={{ color: "#8B8FA8" }}>Jump to question</p>
          <div className="flex gap-2 overflow-x-auto dr-scroll pb-2">
            {visiblePills.map((n) => {
              const s = getPillStyle(n, currentIndex + 1, flagged, answers[n - 1] !== undefined);
              return (
                <button
                  key={n}
                  onClick={() => setCurrentIndex(n - 1)}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-bold flex-shrink-0 transition-all"
                  style={{
                    background: s.bg,
                    color: s.color,
                    border: s.border,
                    minWidth: "36px",
                  }}
                >
                  {n}
                </button>
              );
            })}
            {questions.length > visiblePills.length && visiblePills[visiblePills.length - 1] < questions.length && (
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-medium flex-shrink-0"
                style={{ background: "transparent", border: "1.5px dashed rgba(255,255,255,0.12)", color: "#6B6B7B" }}
              >
                ...
              </div>
            )}
          </div>
        </div>

        <div className="h-2" />
      </div>

      {/* Submit link - red text */}
      <div className="px-4 pt-3 pb-1 flex-shrink-0 text-center">
        <button onClick={submitCurrentExam} className="text-[13px] font-semibold transition-colors hover:opacity-80" style={{ color: "#EF4444" }}>
          Submit exam
        </button>
      </div>

      {/* Prev / Next buttons */}
      <div className="flex gap-3 px-4 pb-6 pt-2 flex-shrink-0">
        <button
          onClick={() => setCurrentIndex((index) => Math.max(0, index - 1))}
          className="flex-1 h-[52px] rounded-xl text-[15px] font-bold transition-all"
          style={{
            border: "1.5px solid rgba(255,255,255,0.12)",
            color: "#8B8FA8",
            background: "transparent"
          }}
        >
          Previous
        </button>
        <button
          onClick={() => setCurrentIndex((index) => Math.min(questions.length - 1, index + 1))}
          className="flex-1 h-[52px] rounded-xl text-[15px] font-bold text-white transition-all"
          style={{
            background: "linear-gradient(135deg, #4F8EF7 0%, #3B7DE8 100%)",
            boxShadow: "0 4px 16px rgba(79,142,247,0.3)",
          }}
        >
          Next
        </button>
      </div>

      {/* AI Tutor FAB */}
      <button
        onClick={() => setTutorOpen(true)}
        className="absolute flex items-center justify-center transition-all active:scale-95"
        style={{
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #4F8EF7 0%, #3B7DE8 100%)",
          boxShadow: "0 4px 20px rgba(79,142,247,0.45)",
          bottom: 76,
          right: 16,
          zIndex: 30,
        }}
        aria-label="Open AI Tutor"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="9" cy="10" r="1" fill="white" />
          <circle cx="12" cy="10" r="1" fill="white" />
          <circle cx="15" cy="10" r="1" fill="white" />
        </svg>
      </button>

      {/* AI Tutor bottom sheet */}
      {tutorOpen && (
        <AIErrorBoundary>
          <AITutorSheet onClose={() => setTutorOpen(false)} currentQuestion={currentQuestion} />
        </AIErrorBoundary>
      )}
    </div>
  );
}
