import fs from 'fs';
import path from 'path';

import { buildChaptersFromMarkdown, courseFromChapters } from './studyCourse';

const lessonsViDir = path.join(process.cwd(), 'content/citizenship/lessons/vi');

function readLesson(file: string): string {
  return fs.readFileSync(path.join(lessonsViDir, `${file}.md`), 'utf8');
}

export function loadStudyCourse() {
  return courseFromChapters(buildChaptersFromMarkdown(readLesson));
}
