import type { BankQuestion, CitizenshipResult } from './types';

export function evaluateCitizenshipTest(
  questions: BankQuestion[],
  answers: Record<string, string>
): CitizenshipResult {
  const values = questions.filter((q) => q.topic === 'values');
  const valuesCorrect = values.filter(
    (q) => answers[q.id] === q.correct
  ).length;
  const overallCorrect = questions.filter(
    (q) => answers[q.id] === q.correct
  ).length;
  const total = questions.length;

  const partCorrect: CitizenshipResult['partCorrect'] = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
  };
  const partTotal: CitizenshipResult['partTotal'] = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
  };

  questions.forEach((q) => {
    partTotal[q.part] += 1;
    if (answers[q.id] === q.correct) {
      partCorrect[q.part] += 1;
    }
  });

  const valuesPassed = values.length > 0 && valuesCorrect === values.length;
  const overallPassed = overallCorrect >= Math.ceil(total * 0.75);
  const passed = valuesPassed && overallPassed;

  return {
    score: total > 0 ? Math.round((overallCorrect / total) * 100) : 0,
    passed,
    correctCount: overallCorrect,
    totalCount: total,
    valuesCorrect,
    valuesTotal: values.length,
    partCorrect,
    partTotal,
  };
}
