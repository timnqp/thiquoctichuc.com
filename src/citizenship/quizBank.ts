import quizBankJson from '../../content/citizenship/quiz-bank.json';

import type { QuizBank } from './types';

export const quizBank = quizBankJson as QuizBank;

export function getPracticeTest(testId: string) {
  return quizBank.tests.find((test) => test.id === testId) ?? null;
}

export function firstPracticeTestId(): string {
  return quizBank.tests[0]?.id ?? 'test-1';
}

export function pickRandomBasicTestId(): string {
  const basic = quizBank.tests.filter((test) => test.difficulty === 'basic');
  const chosen = basic[Math.floor(Math.random() * basic.length)];
  return chosen?.id ?? quizBank.tests[0]!.id;
}
