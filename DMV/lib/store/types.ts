export interface QuestionRecord {
  questionId: string;
  correct: boolean;
  timestamp: number; // Date.now()
  timeSpent: number; // seconds
}

export interface TopicStats {
  topic: string;
  totalAnswered: number;
  totalCorrect: number;
  lastSeen: number; // timestamp
  masteryScore: number; // 0-100
}

export interface ExamResult {
  id: string;
  stateCode: string;
  date: number; // timestamp
  score: number; // correct count
  total: number; // total questions
  passed: boolean;
  topicBreakdown: Record<string, { correct: number; total: number }>;
  timeTaken: number; // seconds
}

export interface UserProgress {
  stateCode: string;
  totalAnswered: number;
  totalCorrect: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string; // "YYYY-MM-DD"
  streakDays: string[]; // last 7 days "YYYY-MM-DD"
  topicStats: Record<string, TopicStats>;
  questionHistory: QuestionRecord[];
  examHistory: ExamResult[];
  readinessScore: number; // 0-100 computed
}
