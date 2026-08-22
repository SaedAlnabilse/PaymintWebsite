import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface LandingFeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  index: number;
  readMoreText?: string;
  onOpen: (index: number) => void;
  ariaLabel?: string;
}

export const LandingFeatureCard: React.FC<LandingFeatureCardProps> = ({
  title,
  description,
  icon: Icon,
  index,
  readMoreText = 'Learn more',
  onOpen,
  ariaLabel,
}) => {
  return (
    <motion.div
      role="button"
      tabIndex={0}
      aria-label={ariaLabel || title}
      onClick={() => onOpen(index)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen(index);
        }
      }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: (index % 4) * 0.08, duration: 0.5 }}
      whileHover={{ y: -6 }}
      className="group relative flex h-full min-h-[250px] cursor-pointer flex-col overflow-hidden rounded-2xl border border-transparent bg-white p-6 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.08)] transition-all duration-500 hover:border-mintcom-green/25 hover:shadow-[0_16px_40px_-14px_rgba(124,195,159,0.28)] focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:border-mintcom-green/30 active:outline-none active:ring-0 dark:border-transparent dark:bg-[#121212] dark:shadow-[0_8px_30px_-12px_rgba(0,0,0,0.45)] dark:hover:border-mintcom-green/20"
    >
      <div className="relative z-10 mb-4 flex min-h-[56px] items-center gap-4">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-mintcom-green/10 shadow-inner transition-all duration-500 group-hover:rotate-3 group-hover:scale-110 group-hover:bg-mintcom-green dark:bg-mintcom-green/15">
          <Icon
            size={22}
            className="text-mintcom-green transition-colors duration-500 group-hover:text-white"
          />
        </div>
        <h3 className="line-clamp-2 flex min-h-[2.5rem] items-center font-sans text-base font-bold leading-tight tracking-tight text-gray-900 transition-colors group-hover:text-mintcom-green dark:text-white">
          {title}
        </h3>
      </div>

      <div className="relative z-10 flex min-h-0 flex-1 flex-col justify-between">
        <p className="line-clamp-3 min-h-[3.75rem] font-sans text-sm font-medium leading-relaxed text-gray-600 dark:text-gray-400">
          {description}
        </p>

        <div className="mt-3">
          <div className="mb-3 h-px w-full bg-gray-200 dark:bg-white/10" />
          <span className="inline-flex items-center gap-1.5 font-sans text-xs font-bold tracking-wide text-mintcom-green transition-colors group-hover:text-mintcom-green/80">
            {readMoreText}
            <ArrowUpRight
              size={11}
              className="text-mintcom-green opacity-0 transition-opacity group-hover:opacity-100"
            />
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default LandingFeatureCard;
