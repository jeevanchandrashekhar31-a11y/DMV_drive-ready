"use client";

import { memo, useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { toast } from "sonner";
import AIErrorBoundary from "./AIErrorBoundary";
import AITutorSheet from "./AITutorSheet";
import { generateExplanation } from "@/lib/ai/explanations";
import { getPrioritizedQueue } from "@/lib/engine/spaceRepetition";
import { getQuestionsForState } from "@/lib/questions";
import { TOPIC_LABELS } from "@/lib/questions/types";
import type { Question } from "@/lib/questions/types";
import { useProgress } from "@/lib/store/useProgress";

interface PracticeModeProps {
  stateCode: string;
  topic?: string;
  onComplete?: (stats: { correct: number; total: number }) => void;
}

const LETTERS = ["A", "B", "C", "D"];

function getTopicLabel(topic: string) {
  return TOPIC_LABELS[topic as keyof typeof TOPIC_LABELS] ?? topic;
}

const QuestionCard = memo(function QuestionCard({
  topicLabel,
  question,
}: {
  topicLabel: string;
  question: string;
}) {
  return (
    <div className="rounded-2xl p-5" style={{ background: "#12122A", border: "1px solid rgba(255,255,255,0.06)" }}>
      <span
        className="inline-block px-3 py-1 rounded-full text-[11px] font-bold text-white mb-3"
        style={{ background: "#4F8EF7" }}
      >
        {topicLabel}
      </span>
      <p className="text-[18px] font-bold text-white leading-relaxed">
        {question}
      </p>
      <p className="text-[13px] mt-2" style={{ color: "#8B8FA8" }}>Select the best answer</p>
    </div>
  );
});

const AnswerOption = memo(function AnswerOption({
  letter,
  option,
  optionStyle,
  letterStyle,
  revealed,
  isCorrect,
  isWrong,
  onSelect,
}: {
  letter: string;
  option: string;
  optionStyle: CSSProperties;
  letterStyle: CSSProperties;
  revealed: boolean;
  isCorrect: boolean;
  isWrong: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className="w-full flex items-center gap-3 px-4 rounded-2xl text-left transition-all"
      style={{
        ...optionStyle,
        minHeight: "64px",
      }}
    >
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-[14px] font-bold flex-shrink-0"
        style={{ ...letterStyle }}
      >
        {revealed && isCorrect ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        ) : revealed && isWrong ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        ) : (
          letter
        )}
      </div>
      <span className="text-[15px] text-white flex-1 leading-snug py-3">{option}</span>
    </button>
  );
});

export default function PracticeMode({ stateCode, topic, onComplete }: PracticeModeProps) {
  const { progress, answerQuestion } = useProgress(stateCode);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [tutorOpen, setTutorOpen] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [questionStartedAt, setQuestionStartedAt] = useState(Date.now());
  const [aiInsight, setAiInsight] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const availableQuestions = useMemo(() => {
    const all = getQuestionsForState(stateCode);
    if (!topic) return all;
    return all.filter((q) => q.topic === topic);
  }, [stateCode, topic]);

  useEffect(() => {
    const prioritized = getPrioritizedQueue(
      availableQuestions,
      progress.questionHistory,
      availableQuestions.length
    );

    setQuestions(prioritized);
    setCurrentIndex(0);
    setSelected(null);
    setCorrectCount(0);
    setAnsweredCount(0);
    setQuestionStartedAt(Date.now());
    setAiInsight("");
    setAiLoading(false);
  }, [availableQuestions, progress.stateCode]);

  const currentQuestion = questions[currentIndex];
  const revealed = selected !== null;
  const isCorrect = currentQuestion ? selected === currentQuestion.correctIndex : false;

  function handleSelect(i: number) {
    if (revealed || !currentQuestion) return;

    const correct = i === currentQuestion.correctIndex;
    const timeSpent = Math.max(1, Math.round((Date.now() - questionStartedAt) / 1000));

    setSelected(i);
    setAnsweredCount((count) => count + 1);
    if (correct) {
      setCorrectCount((count) => count + 1);
    }

    const updatedProgress = answerQuestion(currentQuestion.id, currentQuestion.topic, correct, timeSpent);

    if (correct) {
      toast.success("Answer saved");

      if (updatedProgress.currentStreak > 0 && updatedProgress.currentStreak % 5 === 0) {
        toast.success(`Great streak! ${updatedProgress.currentStreak} in a row`);
      }
    }

    setAiInsight("");
    setAiLoading(true);

    generateExplanation(currentQuestion, i, (chunk) => {
      setAiInsight((text) => text + chunk);
    })
      .catch(() => {
        setAiInsight("AI insight is unavailable right now. Review the rule above and keep going.");
      })
      .finally(() => {
        setAiLoading(false);
      });
  }

  function handleNext() {
    if (currentIndex >= questions.length - 1) {
      onComplete?.({ correct: correctCount, total: answeredCount });
      return;
    }

    setCurrentIndex((index) => index + 1);
    setSelected(null);
    setQuestionStartedAt(Date.now());
    setAiInsight("");
    setAiLoading(false);
  }

  function getOptionStyle(i: number) {
    if (!revealed || !currentQuestion) {
      return {
        background: "#12122A",
        border: "1.5px solid rgba(255,255,255,0.08)",
      };
    }
    if (i === currentQuestion.correctIndex) {
      return {
        background: "rgba(34,197,94,0.08)",
        border: "2px solid #22C55E",
      };
    }
    if (i === selected && !isCorrect) {
      return {
        background: "rgba(239,68,68,0.08)",
        border: "2px solid #EF4444",
      };
    }
    return {
      background: "#12122A",
      border: "1.5px solid rgba(255,255,255,0.06)",
    };
  }

  function getLetterCircleStyle(i: number) {
    if (!revealed || !currentQuestion) {
      return { background: "transparent", border: "1.5px solid rgba(255,255,255,0.2)", color: "#8B8FA8" };
    }
    if (i === currentQuestion.correctIndex) {
      return { background: "#22C55E", border: "none", color: "#fff" };
    }
    if (i === selected && !isCorrect) {
      return { background: "#EF4444", border: "none", color: "#fff" };
    }
    return { background: "transparent", border: "1.5px solid rgba(255,255,255,0.15)", color: "#8B8FA8" };
  }

  if (!currentQuestion) {
    return (
      <div className="flex flex-col h-full relative" style={{ background: "#0A0A1B" }}>
        <div className="flex-1 flex items-center justify-center px-5 text-center">
          <p className="text-[15px]" style={{ color: "#8B8FA8" }}>
            No practice questions available for this state yet.
          </p>
        </div>
      </div>
    );
  }

  const topicLabel = getTopicLabel(currentQuestion.topic);

  return (
    <div className="flex flex-col h-full relative" style={{ background: "#0A0A1B" }}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 pt-6 pb-3 flex-shrink-0">
        <button className="p-1.5">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8B8FA8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
        <span className="text-[16px] font-bold text-white">{topicLabel}</span>
        <span className="text-[13px] font-medium" style={{ color: "#8B8FA8" }}>
          {currentIndex + 1}/{questions.length}
        </span>
      </div>

      {/* Progress bar */}
      <div className="px-4 flex-shrink-0 mb-4">
        <div className="h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
          <div
            className="h-1.5 rounded-full"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%`, background: "#4F8EF7", transition: "width 0.4s" }}
          />
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto dr-scroll">
        <div className="px-4 space-y-3">
          {/* Question card */}
          <QuestionCard topicLabel={topicLabel} question={currentQuestion.question} />

          {/* Answer options - 60px+ height with green/red borders + icons */}
          {currentQuestion.options.map((option, i) => {
            const optStyle = getOptionStyle(i);
            const letterStyle = getLetterCircleStyle(i);
            const isThisCorrect = i === currentQuestion.correctIndex;
            const isThisWrong = i === selected && !isCorrect;

            return (
              <AnswerOption
                key={`${currentQuestion.id}_${LETTERS[i]}`}
                letter={LETTERS[i]}
                option={option}
                optionStyle={optStyle}
                letterStyle={letterStyle}
                revealed={revealed}
                isCorrect={isThisCorrect}
                isWrong={isThisWrong}
                onSelect={() => handleSelect(i)}
              />
            );
          })}

          {/* Explanation panel - animated slide up */}
          {revealed && (
            <div
              className="rounded-2xl p-5 explanation-slide-in mt-4"
              style={{ background: "#1A1A3E", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <p className="text-[16px] font-bold text-white mb-2">
                Why {LETTERS[currentQuestion.correctIndex]} is correct
              </p>
              <p className="text-[14px] leading-relaxed mb-4" style={{ color: "#B8B8C8" }}>
                {currentQuestion.explanation}
              </p>

              {/* Rule box - amber left border */}
              <div
                className="rounded-xl px-4 py-3 mb-3"
                style={{
                  background: "rgba(245,158,11,0.08)",
                  borderLeft: "4px solid #F59E0B",
                }}
              >
                <p className="text-[12px] font-semibold mb-0.5" style={{ color: "#F59E0B" }}>RULE</p>
                <p className="text-[13px] leading-relaxed text-white">
                  {currentQuestion.rule}
                </p>
              </div>

              {/* Tip box - cyan left border */}
              <div
                className="rounded-xl px-4 py-3 mb-3"
                style={{
                  background: "rgba(0,212,255,0.06)",
                  borderLeft: "4px solid #00D4FF",
                }}
              >
                <p className="text-[12px] font-semibold mb-0.5" style={{ color: "#00D4FF" }}>MEMORY TIP</p>
                <p className="text-[13px] leading-relaxed text-white">
                  {currentQuestion.tip}
                </p>
              </div>

              <div
                className="rounded-xl px-4 py-3 mb-5"
                style={{
                  background: "rgba(79,142,247,0.08)",
                  borderLeft: "4px solid #4F8EF7",
                }}
              >
                <p className="text-[12px] font-semibold mb-0.5" style={{ color: "#4F8EF7" }}>AI INSIGHT</p>
                {aiLoading && !aiInsight ? (
                  <div className="space-y-2 py-1">
                    <div className="h-3 rounded-full animate-pulse" style={{ background: "rgba(255,255,255,0.14)", width: "92%" }} />
                    <div className="h-3 rounded-full animate-pulse" style={{ background: "rgba(255,255,255,0.12)", width: "76%" }} />
                    <div className="h-3 rounded-full animate-pulse" style={{ background: "rgba(255,255,255,0.1)", width: "58%" }} />
                  </div>
                ) : (
                  <p className="text-[13px] leading-relaxed text-white">
                    {aiInsight}
                  </p>
                )}
              </div>

              {/* Next button */}
              <button
                onClick={handleNext}
                className="w-full h-[52px] rounded-xl text-[15px] font-bold text-white flex items-center justify-center gap-2"
                style={{
                  background: "linear-gradient(135deg, #4F8EF7 0%, #3B7DE8 100%)",
                  boxShadow: "0 4px 16px rgba(79,142,247,0.3)",
                }}
              >
                {currentIndex >= questions.length - 1 ? "Finish practice" : "Next question"}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}

          <div className="h-6" />
        </div>
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
