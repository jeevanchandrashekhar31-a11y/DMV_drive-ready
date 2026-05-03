import californiaBank from "./california";
import texasBank from "./texas";
import newYorkBank from "./new_york";
import floridaBank from "./florida";
import illinoisBank from "./illinois";
import genericBank from "./generic";
import type { Question, StateBank, Topic } from "./types";

export const QUESTION_BANKS: Record<string, StateBank> = {
  CA: californiaBank,
  TX: texasBank,
  NY: newYorkBank,
  FL: floridaBank,
  IL: illinoisBank,
};

export function getQuestionsForState(stateCode: string): Question[] {
  return (QUESTION_BANKS[stateCode] ?? genericBank).questions;
}

export function getQuestionsByTopic(stateCode: string, topic: Topic): Question[] {
  return getQuestionsForState(stateCode).filter((q) => q.topic === topic);
}

export function getExamQuestions(stateCode: string, count: number = 40): Question[] {
  const all = getQuestionsForState(stateCode);
  const shuffled = [...all].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
