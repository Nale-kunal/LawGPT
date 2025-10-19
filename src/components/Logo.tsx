import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <svg width="100%" height="100%" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Background circle */}
        <circle cx="16" cy="16" r="16" fill="currentColor" className="text-primary"/>
        
        {/* Scales of justice */}
        <g transform="translate(8, 6)">
          {/* Central pillar */}
          <rect x="7" y="2" width="2" height="12" fill="white"/>
          
          {/* Top beam */}
          <rect x="2" y="2" width="12" height="1" fill="white"/>
          
          {/* Left scale */}
          <circle cx="4" cy="4" r="2" fill="none" stroke="white" strokeWidth="1"/>
          <rect x="3" y="6" width="2" height="1" fill="white"/>
          
          {/* Right scale */}
          <circle cx="12" cy="4" r="2" fill="none" stroke="white" strokeWidth="1"/>
          <rect x="11" y="6" width="2" height="1" fill="white"/>
          
          {/* Base */}
          <rect x="6" y="14" width="4" height="1" fill="white"/>
        </g>
        
        {/* "L" for LawGPT */}
        <text x="20" y="24" fontFamily="Arial, sans-serif" fontSize="12" fontWeight="bold" fill="white">L</text>
      </svg>
    </div>
  );
};

export default Logo;

