import type { Question } from "../questions/types";
import type { QuestionRecord } from "../store/types";

interface QuestionWeight {
  questionId: string;
  weight: number; // higher = show sooner
}

export function computeWeights(
  questions: Question[],
  history: QuestionRecord[]
): QuestionWeight[] {
  const historyMap = new Map<string, QuestionRecord[]>();

  for (const record of history) {
    if (!historyMap.has(record.questionId)) {
      historyMap.set(record.questionId, []);
    }
    historyMap.get(record.questionId)!.push(record);
  }

  return questions.map((q) => {
    const records = historyMap.get(q.id) ?? [];

    if (records.length === 0) {
      return { questionId: q.id, weight: 0.5 };
    }

    const recentRecords = records.slice(-5);
    const wrongCount = recentRecords.filter((r) => !r.correct).length;
    const errorRate = wrongCount / recentRecords.length;

    const lastSeen = records[records.length - 1].timestamp;
    const hoursSinceLastSeen = (Date.now() - lastSeen) / (1000 * 60 * 60);
    const recencyFactor = Math.min(hoursSinceLastSeen / 24, 1);

    const weight = errorRate * 0.7 + recencyFactor * 0.3;

    return { questionId: q.id, weight };
  });
}

export function getPrioritizedQueue(
  questions: Question[],
  history: QuestionRecord[],
  count: number = 20
): Question[] {
  const weights = computeWeights(questions, history);

  const sorted = weights
    .map((w) => ({ ...w, weight: w.weight + Math.random() * 0.1 }))
    .sort((a, b) => b.weight - a.weight);

  const topIds = new Set(sorted.slice(0, count).map((w) => w.questionId));
  return questions.filter((q) => topIds.has(q.id));
}

export function getWeakTopicQueue(
  questions: Question[],
  history: QuestionRecord[],
  topic: string,
  count: number = 10
): Question[] {
  const topicQuestions = questions.filter((q) => q.topic === topic);
  return getPrioritizedQueue(topicQuestions, history, count);
}
