import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

const LeafIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 100 100" 
    className={className}
    fill="currentColor"
  >
    <path d="M20 80 C20 80, 20 40, 50 20 C80 40, 80 80, 80 80 C70 70, 60 65, 50 65 C40 65, 30 70, 20 80 Z" 
          fill="#8FBC8F" 
          stroke="#6B8E6B" 
          strokeWidth="1"/>
    <path d="M25 75 Q35 45, 50 35 Q65 45, 75 75" 
          stroke="#6B8E6B" 
          strokeWidth="1" 
          fill="none" 
          opacity="0.6"/>
    <path d="M30 70 Q40 50, 50 45 Q60 50, 70 70" 
          stroke="#6B8E6B" 
          strokeWidth="0.8" 
          fill="none" 
          opacity="0.4"/>
  </svg>
);

export const Logo: React.FC<LogoProps> = ({ 
  className = "", 
  size = "md", 
  showText = true 
}) => {
  const sizeClasses = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-4xl"
  };

  const iconSizes = {
    sm: "w-6 h-6",
    md: "w-8 h-8", 
    lg: "w-12 h-12"
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <LeafIcon className={iconSizes[size]} />
      {showText && (
        <span className={`font-paymint font-semibold text-paymint-dark ${sizeClasses[size]}`}>
          PayMint
          <span className="text-paymint-green">.</span>
        </span>
      )}
    </div>
  );
};