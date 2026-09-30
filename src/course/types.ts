// === Quiz ===

export type QuizOption = {
  id: string;
  text: string;
};

export type QuizQuestion = {
  id: string;
  question: string;
  options: QuizOption[];
  correct: string; // option id
};

// === Chapter Items (discriminated union) ===

export type LessonItem = {
  id: string;
  type: 'lesson';
  title: string;
  video_url: string;
  notes_md: string;
};

export type InfoItem = {
  id: string;
  type: 'info';
  title: string;
  content_md: string;
};

export type QuizItem = {
  id: string;
  type: 'quiz';
  title: string;
  passing_score: number;
  questions: QuizQuestion[];
};

export type ChapterItem = LessonItem | InfoItem | QuizItem;

// === Chapter ===

export type Chapter = {
  id: string;
  title: string;
  items: ChapterItem[];
};

// === Course ===

export type CourseStatus = 'active' | 'draft' | 'archived';

export type Course = {
  _id?: string;
  slug: string;
  title: string;
  desc: string;
  banner: string;
  status: CourseStatus;
  chapters: Chapter[];
};

// === Progress tracking ===

export type QuizResult = {
  score: number;
  passed: boolean;
};

export type CourseProgress = {
  completedItems: string[];
  quizResults: Record<string, QuizResult>;
  lastChapterId: string;
  lastItemId: string;
};
