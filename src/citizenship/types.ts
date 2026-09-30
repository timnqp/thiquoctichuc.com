export type QuizTopic = 'values' | 'general';

export type QuizOptionId = 'a' | 'b' | 'c';

export type BankOption = {
  id: QuizOptionId;
  text: string;
};

export type BankQuestion = {
  id: string;
  topic: QuizTopic;
  part: 1 | 2 | 3 | 4;
  difficulty: 'basic' | 'advanced';
  question: string;
  options: BankOption[];
  correct: QuizOptionId;
  explain_en: string;
  explain_vi: string;
  /** Optional teaching image path under /public, e.g. flag diagrams */
  image?: string;
  image_alt?: string;
};

export type PracticeTest = {
  id: string;
  title: string;
  difficulty: 'basic' | 'advanced';
  questions: BankQuestion[];
};

export type QuizBank = {
  meta: {
    source: string;
    license_note: string;
    rules: string;
    language: string;
  };
  tests: PracticeTest[];
};

export type CitizenshipResult = {
  score: number;
  passed: boolean;
  correctCount: number;
  totalCount: number;
  valuesCorrect: number;
  valuesTotal: number;
  partCorrect: Record<1 | 2 | 3 | 4, number>;
  partTotal: Record<1 | 2 | 3 | 4, number>;
  timedOut?: boolean;
};

export type PracticeAttempt = {
  testId: string;
  startedAt: number;
  endsAt: number;
  answers: Record<string, string>;
  reviewLater: string[];
  currentIndex: number;
  submitted: boolean;
  timedOut?: boolean;
};

export type StudyProgress = {
  completedItems: string[];
  lastChapterId: string;
  lastItemId: string;
};
