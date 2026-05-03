import { ollamaGenerate } from "./ollama";
import type { Question } from "../questions/types";

const SYSTEM_PROMPT = `You are a friendly, expert DMV driving instructor.
Your job is to help students understand traffic laws clearly and memorably.
Keep responses concise: 2-3 sentences max for explanations, 1 sentence for tips.
Always be encouraging. Never use technical jargon without explaining it.
Format your response as plain text only - no markdown, no bullet points.`;

export async function generateExplanation(
  question: Question,
  userAnswerIndex: number,
  onChunk?: (chunk: string) => void
): Promise<string> {
  const userAnswer = question.options[userAnswerIndex];
  const correctAnswer = question.options[question.correctIndex];
  const wasCorrect = userAnswerIndex === question.correctIndex;

  const prompt = wasCorrect
    ? `The student correctly answered a DMV question. Reinforce why they were right.
Question: "${question.question}"
Correct answer: "${correctAnswer}"
Law reference: ${question.rule}
Give a 2-sentence reinforcement of why this answer is correct. End with one memory tip.`
    : `The student got this DMV question wrong. Help them understand their mistake.
Question: "${question.question}"
Student answered: "${userAnswer}" (WRONG)
Correct answer: "${correctAnswer}"
Law reference: ${question.rule}
Explain in 2 sentences why the correct answer is right and why the student's choice was wrong. End with one memory tip to remember this rule.`;

  return ollamaGenerate(prompt, SYSTEM_PROMPT, onChunk);
}

export async function generateWeaknessAnalysis(
  weakTopics: Array<{ topic: string; masteryScore: number }>,
  stateCode: string,
  onChunk?: (chunk: string) => void
): Promise<string> {
  const topicList = weakTopics
    .map((t) => `${t.topic}: ${Math.round(t.masteryScore)}% mastery`)
    .join(", ");

  const prompt = `A student studying for the ${stateCode} DMV permit test has these weak areas: ${topicList}.
Give them a personalized 3-sentence study plan. Be specific about what to focus on and why. Be encouraging.`;

  return ollamaGenerate(prompt, SYSTEM_PROMPT, onChunk);
}

export async function generateReadinessPrediction(
  readinessScore: number,
  stateCode: string,
  weakTopicsCount: number,
  onChunk?: (chunk: string) => void
): Promise<string> {
  const prompt = `A student has a ${readinessScore}% readiness score for the ${stateCode} DMV permit test.
They have ${weakTopicsCount} weak topic areas remaining.
In 2 sentences, tell them their estimated pass probability and what single thing would help most.`;

  return ollamaGenerate(prompt, SYSTEM_PROMPT, onChunk);
}
