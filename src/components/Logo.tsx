import React from 'react';
import WhiteLogo from '../assets/White Green Full Logo.png';
import GreenLogo from '../assets/Green Full Logo.png';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Logo: React.FC<LogoProps> = ({
  className = "",
  size = "md"
}) => {
  const logoSizes = {
    sm: "h-10",
    md: "h-14",
    lg: "h-20"
  };

  return (
    <div className={`flex items-center ${className}`}>
      <img
        src={WhiteLogo}
        alt="PayMint Logo"
        className={`${logoSizes[size]} w-auto object-contain hidden dark:block`}
      />
      <img
        src={GreenLogo}
        alt="PayMint Logo"
        className={`${logoSizes[size]} w-auto object-contain block dark:hidden`}
      />
    </div>
  );
};