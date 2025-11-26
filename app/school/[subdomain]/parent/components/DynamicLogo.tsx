'use client'

import React from 'react';

interface DynamicLogoProps {
  subdomain: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

// Function to style school name creatively
const styleSchoolName = (name: string): string => {
  // Remove hyphens and split into words
  const words = name.replace(/-/g, ' ').split(' ');
  
  // Capitalize each word and join with spaces, then append SCHOOL
  const formattedName = words.map(word => word.toUpperCase()).join(' ');
  return `${formattedName} SCHOOL`;
};

// Function to style initials creatively
const getSchoolInitials = (schoolName: string): string => {
  const words = schoolName.replace(/-/g, ' ').split(' ');
  if (words.length === 1) {
    // For single word, take first two letters
    return words[0].substring(0, 2).toUpperCase();
  }
  // For multiple words, take first letter of first two words
  return words.slice(0, 2).map(word => word[0].toUpperCase()).join('');
};

// Function to generate a deterministic color based on school name
const getSchoolColor = (schoolName: string): { from: string; to: string } => {
  // Simple hash function to generate a number from the school name
  const hash = schoolName.split('').reduce((acc, char) => {
    return acc + char.charCodeAt(0);
  }, 0);
  
  // List of nice color pairs (from, to) for gradients
  const colorPairs = [
    { from: '#246a59', to: '#1a4d41' }, // Original SQUL green
    { from: '#4a5568', to: '#2d3748' }, // Slate
    { from: '#3182ce', to: '#2b6cb0' }, // Blue
    { from: '#805ad5', to: '#6b46c1' }, // Purple
    { from: '#dd6b20', to: '#c05621' }, // Orange
    { from: '#e53e3e', to: '#c53030' }, // Red
    { from: '#38a169', to: '#2f855a' }, // Green
    { from: '#d69e2e', to: '#b7791f' }, // Yellow
  ];
  
  // Select a color pair based on the hash
  return colorPairs[hash % colorPairs.length];
};

export const DynamicLogo = ({ subdomain, size = 'md', showText = true, className = '' }: DynamicLogoProps) => {
  // Generate school initials for logo
  const initials = getSchoolInitials(subdomain);
  
  // Generate school color for branding
  const { from: fromColor, to: toColor } = getSchoolColor(subdomain);
  
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-lg'
  };

  return (
    <div className={`flex items-center gap-3 group relative ${className}`}>
      <div className="relative">
        {/* Main logo container with stacked layout */}
        <div 
          className={`${sizeClasses[size]} rounded-2xl shadow-lg flex flex-col items-center justify-center transform transition-all duration-300 ease-out group-hover:scale-105 group-hover:shadow-xl group-hover:rotate-3 relative z-10 overflow-hidden`}
          style={{ 
            background: `linear-gradient(135deg, ${fromColor}, ${toColor})` 
          }}
        >
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-4 h-4 bg-white/10 rounded-bl-xl" />
          <div className="absolute bottom-0 left-0 w-3 h-3 bg-black/10 rounded-tr-lg" />
          
          {/* School initials - split into two lines for design */}
          <div className="flex flex-col items-center justify-center h-full relative z-10">
            <div className="text-white font-mono font-black tracking-wider leading-none">
              {initials.split('').join('\n')}
            </div>
            <div className="w-3 h-0.5 bg-white/30 my-0.5 rounded-full" />
            <div className="text-[0.5rem] text-white/70 font-semibold tracking-wider">EDU</div>
          </div>

          {/* Inner glow and patterns */}
          <div 
            className="absolute inset-0 opacity-30"
            style={{
              background: `radial-gradient(circle at 70% 30%, ${fromColor}00, ${toColor} 70%)`
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
        </div>
        
        {/* Subtle glow effect */}
        <div 
          className="absolute -inset-2 rounded-3xl opacity-0 group-hover:opacity-20 blur-xl transition-all duration-300"
          style={{ 
            background: `linear-gradient(135deg, ${fromColor}, ${toColor})` 
          }}
        />
      </div>

      {/* School name with refined typography */}
      {showText && (
        <div className="relative py-0.5">
          <div className="flex flex-col">
            <span className="font-bold text-sm tracking-wide text-slate-900 dark:text-slate-100 relative group-hover:translate-x-1 transition-all duration-300">
              {styleSchoolName(subdomain)}
              {/* Animated underline */}
              <div 
                className="absolute bottom-0 left-0 w-0 h-px group-hover:w-full transition-all duration-300"
                style={{ 
                  background: `linear-gradient(to right, ${fromColor}, ${toColor})` 
                }}
              />
            </span>
          </div>
        </div>
      )}
    </div>
  );
}; 