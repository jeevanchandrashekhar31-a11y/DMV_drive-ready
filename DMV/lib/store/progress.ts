import { TOPIC_LABELS } from "../questions/types";
import type { ExamResult, TopicStats, UserProgress } from "./types";

const STORAGE_KEY = "driveready_progress_v1";
const SAVE_DEBOUNCE_MS = 2000;

let cachedProgress: UserProgress | null = null;
let saveTimer: ReturnType<typeof setTimeout> | null = null;
let beforeUnloadRegistered = false;

function hasLocalStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function getToday(): string {
  return new Date().toISOString().slice(0, 10);
}

function getYesterday(): string {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return date.toISOString().slice(0, 10);
}

function createTopicStats(): Record<string, TopicStats> {
  return Object.keys(TOPIC_LABELS).reduce<Record<string, TopicStats>>((stats, topic) => {
    stats[topic] = {
      topic,
      totalAnswered: 0,
      totalCorrect: 0,
      lastSeen: 0,
      masteryScore: 0,
    };
    return stats;
  }, {});
}

function generateId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function writeProgress(progress: UserProgress): void {
  if (!hasLocalStorage()) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

function flushPendingSave(): void {
  if (!cachedProgress) {
    return;
  }

  if (saveTimer) {
    clearTimeout(saveTimer);
    saveTimer = null;
  }

  writeProgress(cachedProgress);
}

function ensureBeforeUnloadFlush(): void {
  if (!hasLocalStorage() || beforeUnloadRegistered) {
    return;
  }

  window.addEventListener("beforeunload", flushPendingSave);
  beforeUnloadRegistered = true;
}

function recalculateReadiness(progress: UserProgress): number {
  const stats = Object.values(progress.topicStats);
  const totalAnswered = stats.reduce((sum, topic) => sum + topic.totalAnswered, 0);

  if (totalAnswered === 0) {
    return 0;
  }

  const weightedScore = stats.reduce((sum, topic) => {
    return sum + topic.masteryScore * topic.totalAnswered;
  }, 0);

  return Math.round(Math.min(100, weightedScore / totalAnswered));
}

function normalizeProgress(progress: UserProgress, stateCode: string): UserProgress {
  const topicStats = {
    ...createTopicStats(),
    ...(progress.topicStats ?? {}),
  };

  return {
    stateCode,
    totalAnswered: progress.totalAnswered ?? 0,
    totalCorrect: progress.totalCorrect ?? 0,
    currentStreak: progress.currentStreak ?? 0,
    longestStreak: progress.longestStreak ?? 0,
    lastActiveDate: progress.lastActiveDate ?? "",
    streakDays: progress.streakDays ?? [],
    topicStats,
    questionHistory: progress.questionHistory ?? [],
    examHistory: progress.examHistory ?? [],
    readinessScore: progress.readinessScore ?? 0,
  };
}

export function initProgress(stateCode: string): UserProgress {
  return {
    stateCode,
    totalAnswered: 0,
    totalCorrect: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastActiveDate: "",
    streakDays: [],
    topicStats: createTopicStats(),
    questionHistory: [],
    examHistory: [],
    readinessScore: 0,
  };
}

export function loadProgress(stateCode: string): UserProgress {
  if (cachedProgress?.stateCode === stateCode) {
    return normalizeProgress(cachedProgress, stateCode);
  }

  if (!hasLocalStorage()) {
    return initProgress(stateCode);
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    cachedProgress = initProgress(stateCode);
    return cachedProgress;
  }

  try {
    const parsed = JSON.parse(raw) as UserProgress;

    if (parsed.stateCode !== stateCode) {
      cachedProgress = initProgress(stateCode);
      return cachedProgress;
    }

    cachedProgress = normalizeProgress(parsed, stateCode);
    return cachedProgress;
  } catch {
    cachedProgress = initProgress(stateCode);
    return cachedProgress;
  }
}

export function saveProgress(progress: UserProgress): void {
  progress.lastActiveDate = getToday();
  cachedProgress = progress;

  if (!hasLocalStorage()) {
    return;
  }

  ensureBeforeUnloadFlush();

  if (saveTimer) {
    clearTimeout(saveTimer);
  }

  saveTimer = setTimeout(() => {
    if (cachedProgress) {
      writeProgress(cachedProgress);
    }
    saveTimer = null;
  }, SAVE_DEBOUNCE_MS);
}

export function recordAnswer(
  stateCode: string,
  questionId: string,
  topic: string,
  correct: boolean,
  timeSpent: number
): UserProgress {
  const progress = loadProgress(stateCode);
  const now = Date.now();
  const today = getToday();
  const wasFirstAnswerToday = progress.lastActiveDate !== today;

  const topicStats = {
    ...progress.topicStats,
    [topic]: progress.topicStats[topic] ?? {
      topic,
      totalAnswered: 0,
      totalCorrect: 0,
      lastSeen: 0,
      masteryScore: 0,
    },
  };

  const currentTopic = topicStats[topic];
  const updatedTopic: TopicStats = {
    ...currentTopic,
    totalAnswered: currentTopic.totalAnswered + 1,
    totalCorrect: currentTopic.totalCorrect + (correct ? 1 : 0),
    lastSeen: now,
    masteryScore: Math.min(
      100,
      Math.round(((currentTopic.totalCorrect + (correct ? 1 : 0)) / (currentTopic.totalAnswered + 1)) * 100)
    ),
  };

  topicStats[topic] = updatedTopic;

  let currentStreak = progress.currentStreak;
  let streakDays = progress.streakDays;

  if (wasFirstAnswerToday) {
    currentStreak = progress.lastActiveDate === getYesterday() ? progress.currentStreak + 1 : 1;
    streakDays = [...new Set([...progress.streakDays, today])].slice(-7);
  }

  const updatedProgress: UserProgress = {
    ...progress,
    totalAnswered: progress.totalAnswered + 1,
    totalCorrect: progress.totalCorrect + (correct ? 1 : 0),
    currentStreak,
    longestStreak: Math.max(progress.longestStreak, currentStreak),
    lastActiveDate: today,
    streakDays,
    topicStats,
    questionHistory: [
      ...progress.questionHistory,
      {
        questionId,
        correct,
        timestamp: now,
        timeSpent,
      },
    ],
    readinessScore: 0,
  };

  updatedProgress.readinessScore = recalculateReadiness(updatedProgress);
  saveProgress(updatedProgress);

  return updatedProgress;
}

export function recordExamResult(
  stateCode: string,
  result: Omit<ExamResult, "id">
): UserProgress {
  const progress = loadProgress(stateCode);
  const examResult: ExamResult = {
    ...result,
    id: generateId(),
  };

  const updatedProgress: UserProgress = {
    ...progress,
    examHistory: [...progress.examHistory, examResult],
  };

  saveProgress(updatedProgress);
  return updatedProgress;
}

export function getWeakTopics(progress: UserProgress): TopicStats[] {
  return Object.values(progress.topicStats)
    .filter((topic) => topic.masteryScore < 70)
    .sort((a, b) => a.masteryScore - b.masteryScore);
}

export function getReadinessScore(progress: UserProgress): number {
  return recalculateReadiness(progress);
}

export function resetProgress(stateCode: string): void {
  if (!hasLocalStorage()) {
    return;
  }

  if (saveTimer) {
    clearTimeout(saveTimer);
    saveTimer = null;
  }

  cachedProgress = initProgress(stateCode);
  window.localStorage.removeItem(STORAGE_KEY);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cachedProgress));
}
