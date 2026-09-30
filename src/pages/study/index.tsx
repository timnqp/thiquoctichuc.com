import { GetStaticProps, InferGetStaticPropsType } from 'next';
import Link from 'next/link';

import { CitizenshipAdBanner } from '../../ads/AdUnit';
import { BuyMeACoffee } from '../../citizenship/BuyMeACoffee';
import { DerivedFromOcb } from '../../citizenship/DerivedFromOcb';
import { useStudyProgress } from '../../citizenship/useLocalProgress';
import { routes, studyLessonHref } from '../../config/routes';
import { useTranslation } from '../../context/LanguageContext';
import type { Course } from '../../course/types';
import { Meta } from '../../layout/Meta';
import { Section } from '../../layout/Section';
import { CitizenshipNavBar } from '../../navigation/CitizenshipNavBar';
import { Footer } from '../../templates/Footer';

const StudyOverview = (
  data: InferGetStaticPropsType<typeof getStaticProps>
) => {
  const { t } = useTranslation();
  const { progress } = useStudyProgress();
  const course: Course = data.course;
  const startId =
    progress.lastItemId || course.chapters[0]?.items[0]?.id || '1';

  return (
    <div className="antialiased text-gray-600 min-h-screen flex flex-col">
      <Meta title={t('cit_lessons_tab')} description={course.desc} />
      <CitizenshipNavBar />
      <Section>
        <h1 className="text-black text-center font-fancy text-3xl lg:text-4xl mt-10">
          {t('cit_lessons_title')}
        </h1>
        <p className="text-center text-gray-700 font-light mt-4 mb-6">
          {t('cit_lessons_desc')}
        </p>
        <div className="text-center mb-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          <Link
            href={studyLessonHref(startId)}
            className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-8 rounded-lg transition-colors"
          >
            {t('cit_lessons_start')}
          </Link>
          <Link
            href={routes.practice}
            className="text-orange-600 hover:text-orange-800 underline font-medium"
          >
            {t('cit_go_to_practice')}
          </Link>
        </div>
        <div className="mb-10">
          {course.chapters.map((chapter) => {
            const allDone =
              chapter.items.length > 0 &&
              chapter.items.every((item) =>
                progress.completedItems.includes(item.id)
              );
            return (
              <div
                key={chapter.id}
                className="border rounded-lg mb-2 border-gray-300"
              >
                <div className="px-4 py-3 font-medium text-gray-800 flex items-center gap-2">
                  <span>{chapter.title}</span>
                  {allDone ? (
                    <span className="text-green-500 text-sm">✓</span>
                  ) : null}
                </div>
                <div className="border-t border-gray-200 px-4 py-2">
                  {chapter.items.map((item) => {
                    const done = progress.completedItems.includes(item.id);
                    return (
                      <Link
                        key={item.id}
                        href={studyLessonHref(item.id)}
                        className="flex items-center gap-2 py-1.5 text-sm text-gray-700 hover:text-orange-700"
                      >
                        <span>{done ? '✓' : '📄'}</span>
                        <span>{item.title}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
        <CitizenshipAdBanner />
        <div className="mt-10">
          <DerivedFromOcb />
        </div>
        <div className="flex justify-center mt-8 mb-4">
          <BuyMeACoffee />
        </div>
      </Section>
      <Footer />
    </div>
  );
};

export const getStaticProps: GetStaticProps<{ course: Course }> = async () => {
  const { loadStudyCourse } = await import('../../citizenship/loadStudyCourses');
  return { props: { course: loadStudyCourse() } };
};

export default StudyOverview;
