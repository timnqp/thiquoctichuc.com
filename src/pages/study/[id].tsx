import { useCallback, useEffect, useMemo, useState } from 'react';

import { GetStaticPaths, GetStaticProps, InferGetStaticPropsType } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';

import { CitizenshipAdBanner } from '../../ads/AdUnit';
import { trackCitEvent } from '../../citizenship/analytics';
import { BuyMeACoffee } from '../../citizenship/BuyMeACoffee';
import { DerivedFromOcb } from '../../citizenship/DerivedFromOcb';
import {
  findItemLocation,
  STUDY_ITEM_IDS,
} from '../../citizenship/studyCourse';
import { useStudyProgress } from '../../citizenship/useLocalProgress';
import { AppConfig } from '../../config/appConfig';
import { routes, studyLessonHref } from '../../config/routes';
import { useTranslation } from '../../context/LanguageContext';
import CourseSidebar from '../../course/CourseSidebar';
import InfoView from '../../course/InfoView';
import type { Chapter, ChapterItem, Course, InfoItem } from '../../course/types';
import { Meta } from '../../layout/Meta';
import { CitizenshipNavBar } from '../../navigation/CitizenshipNavBar';
import { Footer } from '../../templates/Footer';

type FlatItem = {
  chapterId: string;
  item: ChapterItem;
};

function flattenCourse(chapters: Chapter[]): FlatItem[] {
  return chapters.flatMap((ch) =>
    ch.items.map((item) => ({ chapterId: ch.id, item }))
  );
}

const StudyLesson = (
  data: InferGetStaticPropsType<typeof getStaticProps>
) => {
  const { t } = useTranslation();
  const router = useRouter();
  const course: Course = data.course;
  const {
    progress,
    isItemCompleted,
    completeItem,
    savePosition,
  } = useStudyProgress();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const flatItems = useMemo(
    () => flattenCourse(course.chapters),
    [course.chapters]
  );

  const queryId = typeof router.query.id === 'string' ? router.query.id : data.id;
  const activeItemId = STUDY_ITEM_IDS.includes(queryId) ? queryId : '1';
  const currentFlatIndex = flatItems.findIndex((f) => f.item.id === activeItemId);
  const currentFlat =
    currentFlatIndex >= 0 ? flatItems[currentFlatIndex] : flatItems[0];
  const currentItem = currentFlat?.item;
  const totalItems = flatItems.length;
  const overallProgress =
    totalItems === 0
      ? 0
      : Math.round((progress.completedItems.length / totalItems) * 100);
  const stepNumber = currentFlatIndex >= 0 ? currentFlatIndex + 1 : 1;

  useEffect(() => {
    trackCitEvent('cit_lesson_view', { lesson_id: activeItemId });
  }, [activeItemId]);

  const navigateTo = useCallback(
    (chapterId: string, itemId: string) => {
      savePosition(chapterId, itemId);
      setSidebarOpen(false);
      router.replace(studyLessonHref(itemId), undefined, {
        shallow: true,
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [router, savePosition]
  );

  const goNext = useCallback(() => {
    if (currentFlatIndex < 0 || currentFlatIndex >= flatItems.length - 1) return;
    const next = flatItems[currentFlatIndex + 1]!;
    navigateTo(next.chapterId, next.item.id);
  }, [currentFlatIndex, flatItems, navigateTo]);

  const goPrevious = useCallback(() => {
    if (currentFlatIndex <= 0) return;
    const prev = flatItems[currentFlatIndex - 1]!;
    navigateTo(prev.chapterId, prev.item.id);
  }, [currentFlatIndex, flatItems, navigateTo]);

  const handleComplete = useCallback(() => {
    if (currentItem && currentFlat) {
      const alreadyDone = progress.completedItems.includes(currentItem.id);
      completeItem(currentItem.id, currentFlat.chapterId);
      if (!alreadyDone) {
        trackCitEvent('cit_lesson_complete', { lesson_id: currentItem.id });
        const nextCount = progress.completedItems.length + 1;
        if (nextCount >= STUDY_ITEM_IDS.length) {
          trackCitEvent('cit_study_complete');
        }
      }
    }
  }, [completeItem, currentFlat, currentItem, progress.completedItems]);

  const previousItem =
    currentFlatIndex > 0 ? flatItems[currentFlatIndex - 1]?.item : null;
  const nextItem =
    currentFlatIndex >= 0 && currentFlatIndex < flatItems.length - 1
      ? flatItems[currentFlatIndex + 1]?.item
      : null;

  const infoItem: InfoItem | null =
    currentItem && currentItem.type === 'info' ? currentItem : null;

  const practiceCtaClass =
    'flex-shrink-0 text-sm bg-orange-500 hover:bg-orange-600 text-white font-medium px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors';

  return (
    <div className="min-h-screen flex flex-col bg-white antialiased text-gray-600">
      <Meta
        title={`${course.title} · ${AppConfig.title}`}
        description={course.desc}
      />
      <CitizenshipNavBar />

      <div className="md:hidden border-b border-gray-200 bg-white">
        <div className="px-3 py-2 flex items-center gap-2">
          <button
            className="flex-shrink-0 w-10 h-10 rounded-lg border border-gray-300 bg-white text-gray-800 hover:bg-orange-50 hover:border-orange-400 hover:text-orange-600 flex items-center justify-center"
            onClick={() => setSidebarOpen((prev) => !prev)}
            type="button"
            aria-expanded={sidebarOpen}
            aria-label={sidebarOpen ? t('cit_collapse_lessons') : t('cit_expand_lessons')}
          >
            {sidebarOpen ? (
              <span className="text-xl leading-none">←</span>
            ) : (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-gray-500 tabular-nums">
              {stepNumber}/{totalItems}
            </p>
            <p className="text-sm font-medium text-gray-800 truncate">
              {currentItem?.title ?? course.title}
            </p>
          </div>
          <Link href={routes.practice} className={practiceCtaClass}>
            {t('nav_resources_practice')}
          </Link>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <aside className="hidden md:block w-80 flex-shrink-0 border-r border-gray-200 bg-gray-50 overflow-y-auto">
          <div className="px-4 pt-4 pb-2">
            <Link
              href={routes.practice}
              className="inline-flex items-center text-sm bg-orange-500 hover:bg-orange-600 text-white font-medium px-3 py-2 rounded-lg transition-colors"
            >
              {t('nav_resources_practice')}
            </Link>
          </div>
          <CourseSidebar
            chapters={course.chapters}
            activeItemId={activeItemId}
            isChapterAccessible={() => true}
            isItemCompleted={isItemCompleted}
            onSelectItem={navigateTo}
            overallProgress={overallProgress}
          />
        </aside>

        {sidebarOpen ? (
          <>
            <div
              className="md:hidden fixed inset-0 bg-black/30 z-40"
              onClick={() => setSidebarOpen(false)}
              onKeyDown={() => setSidebarOpen(false)}
              role="presentation"
            />
            <aside className="md:hidden fixed left-0 top-0 bottom-0 w-[min(20rem,88vw)] bg-gray-50 z-50 overflow-y-auto shadow-lg">
              <div className="sticky top-0 z-10 bg-gray-50 border-b border-gray-200 px-3 py-3">
                <div className="flex items-center gap-2">
                  <button
                    className="flex-shrink-0 w-10 h-10 rounded-lg border border-gray-300 bg-white text-gray-800 text-xl leading-none hover:bg-orange-50 hover:border-orange-400 hover:text-orange-600"
                    onClick={() => setSidebarOpen(false)}
                    type="button"
                    aria-label={t('cit_collapse_lessons')}
                  >
                    ←
                  </button>
                  <p className="text-sm font-medium text-gray-800">
                    {t('cit_lesson_outline')}
                  </p>
                </div>
              </div>
              <CourseSidebar
                chapters={course.chapters}
                activeItemId={activeItemId}
                isChapterAccessible={() => true}
                isItemCompleted={isItemCompleted}
                onSelectItem={navigateTo}
                overallProgress={overallProgress}
              />
            </aside>
          </>
        ) : null}

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {infoItem ? (
            <InfoView
              item={infoItem}
              isCompleted={isItemCompleted(infoItem.id)}
              onComplete={handleComplete}
              onNext={
                currentFlatIndex >= 0 && currentFlatIndex < flatItems.length - 1
                  ? goNext
                  : null
              }
              onPrevious={currentFlatIndex > 0 ? goPrevious : null}
              previousTitle={previousItem?.title ?? null}
              nextTitle={nextItem?.title ?? null}
            />
          ) : (
            <p className="text-gray-500">No content available.</p>
          )}
          <div className="mt-8">
            <DerivedFromOcb />
          </div>
          <CitizenshipAdBanner />
          <div className="mt-10 flex justify-center">
            <BuyMeACoffee />
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: STUDY_ITEM_IDS.map((id) => ({ params: { id } })),
  fallback: false,
});

export const getStaticProps: GetStaticProps<{
  id: string;
  course: Course;
}> = async (context) => {
  const id = context.params?.id;
  if (typeof id !== 'string' || !findItemLocation(id)) {
    return { notFound: true };
  }
  const { loadStudyCourse } = await import('../../citizenship/loadStudyCourses');
  return { props: { id, course: loadStudyCourse() } };
};

export default StudyLesson;
