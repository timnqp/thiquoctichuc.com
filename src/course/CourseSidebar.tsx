import { useState } from 'react';

import { useTranslation } from '../context/LanguageContext';
import type { Chapter, ChapterItem } from './types';

type CourseSidebarProps = {
  chapters: Chapter[];
  activeItemId: string;
  isChapterAccessible: (index: number) => boolean;
  isItemCompleted: (itemId: string) => boolean;
  onSelectItem: (chapterId: string, itemId: string) => void;
  overallProgress: number;
};

const ItemTypeIcon = ({
  type,
  completed,
  locked,
}: {
  type: ChapterItem['type'];
  completed: boolean;
  locked: boolean;
}) => {
  if (completed) return <span className="text-green-500 text-sm">✓</span>;
  if (locked) return <span className="text-gray-300 text-sm">🔒</span>;

  switch (type) {
    case 'lesson':
      return <span className="text-orange-500 text-sm">▶</span>;
    case 'info':
      return <span className="text-blue-500 text-sm">📄</span>;
    case 'quiz':
      return <span className="text-purple-500 text-sm">📋</span>;
    default:
      return null;
  }
};

const CourseSidebar = ({
  chapters,
  activeItemId,
  isChapterAccessible,
  isItemCompleted,
  onSelectItem,
  overallProgress,
}: CourseSidebarProps) => {
  const { t } = useTranslation();

  // Find which chapter contains the active item, default open that one
  const activeChapterIdx = chapters.findIndex((ch) =>
    ch.items.some((item) => item.id === activeItemId)
  );

  const [openChapters, setOpenChapters] = useState<Record<number, boolean>>(
    () => {
      const initial: Record<number, boolean> = {};
      if (activeChapterIdx >= 0) initial[activeChapterIdx] = true;
      else initial[0] = true;
      return initial;
    }
  );

  const toggleChapter = (idx: number) => {
    setOpenChapters((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div className="flex flex-col h-full">
      {/* Progress bar */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>{t('course_overall_progress')}</span>
          <span>{overallProgress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div
            className="bg-orange-500 h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      </div>

      {/* Chapter list */}
      <div className="flex-1 overflow-y-auto">
        {chapters.map((chapter, idx) => {
          const accessible = isChapterAccessible(idx);
          const allCompleted =
            chapter.items.length > 0 &&
            chapter.items.every((item) => isItemCompleted(item.id));
          const isOpen = !!openChapters[idx];

          return (
            <div key={chapter.id} className="border-b border-gray-100">
              {/* Chapter header */}
              <button
                className={`w-full flex items-center justify-between px-4 py-3 text-left text-sm hover:bg-gray-50 transition-colors ${
                  accessible ? '' : 'opacity-50'
                }`}
                onClick={() => toggleChapter(idx)}
                type="button"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-gray-400 text-xs flex-shrink-0">
                    {isOpen ? '▼' : '▶'}
                  </span>
                  <span className="font-medium text-gray-800 truncate">
                    {chapter.title}
                  </span>
                  {allCompleted && (
                    <span className="text-green-500 text-xs flex-shrink-0">
                      ✓
                    </span>
                  )}
                  {!accessible && (
                    <span className="text-gray-400 text-xs flex-shrink-0">
                      🔒
                    </span>
                  )}
                </div>
              </button>

              {/* Items */}
              {isOpen && (
                <div className="pb-2">
                  {chapter.items.map((item) => {
                    const completed = isItemCompleted(item.id);
                    const isActive = item.id === activeItemId;
                    const clickable = accessible;

                    return (
                      <button
                        key={item.id}
                        className={`w-full flex items-center gap-2 px-6 py-2 text-left text-sm transition-colors ${
                          // eslint-disable-next-line no-nested-ternary
                          isActive
                            ? 'bg-orange-50 text-orange-700 border-l-2 border-orange-500'
                            : clickable
                            ? 'hover:bg-gray-50 text-gray-700'
                            : 'text-gray-400 cursor-not-allowed'
                        }`}
                        onClick={() => {
                          if (clickable) onSelectItem(chapter.id, item.id);
                        }}
                        disabled={!clickable}
                        type="button"
                      >
                        <ItemTypeIcon
                          type={item.type}
                          completed={completed}
                          locked={!accessible}
                        />
                        <span className="truncate">{item.title}</span>
                      </button>
                    );
                  })}
                  {!accessible && (
                    <div className="px-6 py-1 text-xs text-gray-400 italic">
                      {t('course_chapter_locked')}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CourseSidebar;
