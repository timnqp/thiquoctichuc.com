import type { Chapter, Course, InfoItem } from '../course/types';

type StudyItemMeta = {
  id: string;
  file: string;
  titleEn: string;
  titleVi: string;
};

export type StudyChapterMeta = {
  id: string;
  titleEn: string;
  titleVi: string;
  items: StudyItemMeta[];
};

export const STUDY_CHAPTERS: StudyChapterMeta[] = [
  {
    id: 'bai-1',
    titleEn: 'Lesson 1 - The citizenship test format',
    titleVi: 'Bài 1 - Cấu trúc bài thi quốc tịch',
    items: [
      {
        id: '1',
        file: '1',
        titleEn: 'How the test works',
        titleVi: 'Bài thi hoạt động thế nào',
      },
    ],
  },
  {
    id: 'bai-2',
    titleEn: 'Lesson 2 - Australia and its people',
    titleVi: 'Bài 2 - Nước Úc và người Úc',
    items: [
      {
        id: '2a',
        file: '2a',
        titleEn: 'First peoples and settlement',
        titleVi: 'Cư dân đầu tiên và những người Anh đầu tiên',
      },
      {
        id: '2b',
        file: '2b',
        titleEn: 'Nation and language',
        titleVi: 'Quốc gia và ngôn ngữ',
      },
      {
        id: '2c',
        file: '2c',
        titleEn: 'States and capitals',
        titleVi: 'Tiểu bang và thủ phủ',
      },
      {
        id: '2d',
        file: '2d',
        titleEn: 'Days, flags and symbols',
        titleVi: 'Ngày lễ, cờ và biểu tượng',
      },
    ],
  },
  {
    id: 'bai-3',
    titleEn: 'Lesson 3 - Democratic beliefs, rights and liberties',
    titleVi: 'Bài 3 - Niềm tin dân chủ, quyền lợi và quyền tự do',
    items: [
      {
        id: '3a',
        file: '3a',
        titleEn: 'Democratic beliefs',
        titleVi: 'Niềm tin dân chủ',
      },
      {
        id: '3b',
        file: '3b',
        titleEn: 'Freedoms',
        titleVi: 'Quyền tự do',
      },
      {
        id: '3c',
        file: '3c',
        titleEn: 'Must and can',
        titleVi: 'Nghĩa vụ và quyền lợi',
      },
    ],
  },
  {
    id: 'bai-4',
    titleEn: 'Lesson 4 - Government and the law in Australia',
    titleVi: 'Bài 4 - Chính phủ và pháp luật ở Úc',
    items: [
      {
        id: '4a',
        file: '4a',
        titleEn: 'Head of State and Prime Minister',
        titleVi: 'Nguyên thủ quốc gia và Thủ tướng',
      },
      {
        id: '4b',
        file: '4b',
        titleEn: 'Two houses of Parliament',
        titleVi: 'Hai viện Quốc hội',
      },
      {
        id: '4c',
        file: '4c',
        titleEn: 'Three levels of government',
        titleVi: 'Ba cấp chính quyền',
      },
      {
        id: '4d',
        file: '4d',
        titleEn: 'Courts and police',
        titleVi: 'Tòa án và cảnh sát',
      },
    ],
  },
  {
    id: 'bai-5',
    titleEn: 'Lesson 5 - Australian values',
    titleVi: 'Bài 5 - Các giá trị của Úc',
    items: [
      {
        id: '5a',
        file: '5a',
        titleEn: 'Values questions are 5/5',
        titleVi: 'Câu về giá trị Úc phải đúng 5/5',
      },
      {
        id: '5b',
        file: '5b',
        titleEn: 'Family and religion',
        titleVi: 'Gia đình và tôn giáo',
      },
      {
        id: '5c',
        file: '5c',
        titleEn: 'Community',
        titleVi: 'Cộng đồng',
      },
    ],
  },
  {
    id: 'bai-6',
    titleEn: 'Lesson 6 - Dates and facts cheatsheet',
    titleVi: 'Bài 6 - Cheatsheet ngày tháng và sự kiện',
    items: [
      {
        id: '6',
        file: '6',
        titleEn: 'Dates, capitals, flags, symbols',
        titleVi: 'Những thông số cần nắm',
      },
    ],
  },
];

export const STUDY_ITEM_IDS = STUDY_CHAPTERS.flatMap((ch) =>
  ch.items.map((item) => item.id)
);

export function findItemLocation(itemId: string) {
  for (const chapter of STUDY_CHAPTERS) {
    const item = chapter.items.find((entry) => entry.id === itemId);
    if (item) {
      return { chapterId: chapter.id, itemId: item.id };
    }
  }
  return null;
}

export function buildChaptersFromMarkdown(
  readLesson: (file: string) => string
): Chapter[] {
  return STUDY_CHAPTERS.map((chapter) => ({
    id: chapter.id,
    title: chapter.titleVi,
    items: chapter.items.map(
      (item): InfoItem => ({
        id: item.id,
        type: 'info',
        title: item.titleVi,
        content_md: readLesson(item.file),
      })
    ),
  }));
}

export function courseFromChapters(chapters: Chapter[]): Course {
  return {
    slug: 'hoc-thi-quoc-tich-uc',
    banner: '',
    status: 'active',
    title: 'Học thi Quốc tịch Úc',
    desc: 'Tóm tắt bài học thi Quốc tịch Úc từ Tài liệu ôn thi Chính thức của Chính Phủ Úc, và mình có bổ sung 1 cheatsheat với các mốc thời gian, thông tin chính cho các bạn ôn nhanh trước giờ thi.',
    chapters,
  };
}
