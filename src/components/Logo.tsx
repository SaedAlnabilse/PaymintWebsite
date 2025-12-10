import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Logo: React.FC<LogoProps> = ({
  className = "",
  size = "md"
}) => {
  const logoSizes = {
    sm: "h-8",
    md: "h-10",
    lg: "h-14"
  };

  return (
    <div className={`flex items-center ${className}`}>
      <img
        src="/paymint-logo-new.png"
        alt="PayMint Logo"
        className={`${logoSizes[size]} w-auto object-contain`}
      />
    </div>
  );
};