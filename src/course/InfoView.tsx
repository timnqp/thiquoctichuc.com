import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { CitizenshipFlags } from '../citizenship/CitizenshipFlags';
import type { InfoItem } from './types';

type InfoViewProps = {
  item: InfoItem;
  isCompleted: boolean;
  onComplete: () => void;
  onNext: (() => void) | null;
  onPrevious: (() => void) | null;
  previousTitle?: string | null;
  nextTitle?: string | null;
};

const markdownClass =
  'prose max-w-none prose-blockquote:border-orange-400 prose-blockquote:text-orange-700';

function MarkdownBlock({ content }: { content: string }) {
  if (!content.trim()) return null;
  return (
    <div className="mb-6">
      <ReactMarkdown className={markdownClass} remarkPlugins={[remarkGfm]}>
        {content}
      </ReactMarkdown>
    </div>
  );
}

function splitBeforeMarker(
  content: string,
  markers: string[]
): [string, string] | null {
  for (const marker of markers) {
    const idx = content.indexOf(marker);
    if (idx >= 0) {
      return [content.slice(0, idx), content.slice(idx)];
    }
  }
  return null;
}

const InfoView = ({
  item,
  isCompleted,
  onComplete,
  onNext,
  onPrevious,
  previousTitle,
  nextTitle,
}: InfoViewProps) => {
  const md = item.content_md || '';

  let beforeFlags: string | null = null;
  let afterFlags: string | null = null;
  let embeddedFlags = false;

  if (item.id === '2d') {
    const parts = splitBeforeMarker(md, ['<!-- FLAGS -->']);
    if (parts) {
      beforeFlags = parts[0];
      // Drop the HTML comment marker from the after block
      afterFlags = parts[1].replace(/^<!-- FLAGS -->\s*/, '');
      embeddedFlags = true;
    }
  } else if (item.id === '6') {
    const parts = splitBeforeMarker(md, ['### Symbols', '### Biểu tượng']);
    if (parts) {
      beforeFlags = parts[0];
      afterFlags = parts[1];
    }
  }

  return (
    <div>
      <h2 className="text-xl lg:text-2xl font-semibold text-gray-800 mb-6">
        {item.title}
      </h2>

      {beforeFlags !== null && afterFlags !== null ? (
        <>
          <MarkdownBlock content={beforeFlags} />
          <CitizenshipFlags embedded={embeddedFlags} />
          <MarkdownBlock content={afterFlags} />
        </>
      ) : (
        <MarkdownBlock content={md} />
      )}

      <div className="flex items-start justify-between gap-4 mt-8 pt-4 border-t border-gray-200">
        <div className="min-w-0 max-w-[45%]">
          {onPrevious && previousTitle && (
            <button
              className="text-left text-gray-600 hover:text-orange-700 font-medium transition-colors"
              onClick={onPrevious}
              type="button"
            >
              <span className="block">←</span>
              <span className="block text-sm font-normal leading-snug mt-0.5">
                {previousTitle}
              </span>
            </button>
          )}
        </div>
        <div className="min-w-0 max-w-[45%] text-right">
          {onNext && nextTitle ? (
            <button
              className="text-right text-orange-600 hover:text-orange-800 font-medium transition-colors"
              onClick={() => {
                if (!isCompleted) onComplete();
                onNext();
              }}
              type="button"
            >
              <span className="block">→</span>
              <span className="block text-sm font-normal leading-snug mt-0.5">
                {nextTitle}
              </span>
            </button>
          ) : !isCompleted ? (
            <button
              className="text-right text-orange-600 hover:text-orange-800 font-medium transition-colors"
              onClick={onComplete}
              type="button"
            >
              <span className="block text-sm font-normal leading-snug">✓</span>
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default InfoView;
