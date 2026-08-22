import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface SectionCarouselFooterProps {
  totalCount: number;
  activeIndex: number;
  onPrev: () => void;
  onNext: () => void;
  onJumpTo: (index: number) => void;
  isRtl?: boolean;
  prevLabel?: string;
  nextLabel?: string;
}

export const SectionCarouselFooter: React.FC<SectionCarouselFooterProps> = ({
  totalCount,
  activeIndex,
  onPrev,
  onNext,
  onJumpTo,
  isRtl = false,
  prevLabel = 'Previous',
  nextLabel = 'Next',
}) => {
  return (
    <div className="relative z-10 mx-6 flex shrink-0 items-center justify-between gap-4 border-t border-gray-100 py-3.5 dark:border-white/10 md:mx-8 md:py-4">
      <button
        type="button"
        onClick={onPrev}
        aria-label={prevLabel}
        className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 font-sans text-sm font-bold text-gray-700 transition-colors hover:bg-gray-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
      >
        {isRtl ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        <span className="hidden sm:inline">{prevLabel}</span>
      </button>

      <div className="no-scrollbar flex max-w-[55%] items-center gap-1.5 overflow-x-auto">
        {Array.from({ length: totalCount }).map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onJumpTo(i)}
            aria-label={`Go to ${i + 1}`}
            className={`h-2 flex-shrink-0 rounded-full transition-all duration-300 ${
              i === activeIndex
                ? 'w-5 bg-mintcom-green'
                : 'w-2 bg-gray-300 hover:bg-gray-400 dark:bg-white/15 dark:hover:bg-white/25'
            }`}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={onNext}
        aria-label={nextLabel}
        className="flex items-center gap-2 rounded-xl bg-mintcom-green px-4 py-2.5 font-sans text-sm font-bold text-black shadow-[0_4px_20px_-4px_rgba(125,198,162,0.5)] transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_28px_-4px_rgba(125,198,162,0.65)]"
      >
        <span className="hidden sm:inline">{nextLabel}</span>
        {isRtl ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
      </button>
    </div>
  );
};

export default SectionCarouselFooter;
