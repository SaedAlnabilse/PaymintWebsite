import React from 'react';

export interface SplitTextProps {
  text: string;
  className?: string;
}

export const SplitText: React.FC<SplitTextProps> = ({ text, className = '' }) => {
  return (
    <span className={className}>
      {text.split(' ').map((word, i) => {
        const isMintcom = word.toLowerCase().includes('mintcom');
        return (
          <span
            key={i}
            className={
              isMintcom
                ? 'text-mintcom-green'
                : i % 2 === 0
                ? 'text-gray-900 dark:text-white'
                : 'text-mintcom-green'
            }
          >
            {word}{' '}
          </span>
        );
      })}
    </span>
  );
};

export default SplitText;
