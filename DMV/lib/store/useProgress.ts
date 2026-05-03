"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getWeakTopics,
  loadProgress,
  recordAnswer,
  recordExamResult,
  resetProgress,
} from "./progress";
import type { ExamResult, UserProgress } from "./types";

export function useProgress(stateCode: string) {
  const [progress, setProgress] = useState<UserProgress>(() => loadProgress(stateCode));

  useEffect(() => {
    setProgress(loadProgress(stateCode));
  }, [stateCode]);

  const answerQuestion = useCallback(
    (questionId: string, topic: string, correct: boolean, timeSpent: number) => {
      const updated = recordAnswer(stateCode, questionId, topic, correct, timeSpent);
      setProgress(updated);
      return updated;
    },
    [stateCode]
  );

  const submitExam = useCallback(
    (result: Omit<ExamResult, "id">) => {
      const updated = recordExamResult(stateCode, result);
      setProgress(updated);
      return updated;
    },
    [stateCode]
  );

  const reset = useCallback(() => {
    resetProgress(stateCode);
    setProgress(loadProgress(stateCode));
  }, [stateCode]);

  const weakTopics = getWeakTopics(progress);

  return {
    progress,
    answerQuestion,
    submitExam,
    reset,
    weakTopics,
    readinessScore: progress.readinessScore,
    topicStats: progress.topicStats,
  };
}
