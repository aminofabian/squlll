'use client'

import React from 'react';
import { Settings } from 'lucide-react';
import { DynamicLogo } from './DynamicLogo';

interface MobileHeaderProps {
  subdomain: string;
}

export const MobileHeader = ({ subdomain }: MobileHeaderProps) => {
  return (
    <div className="bg-card/90 backdrop-blur-sm shadow-lg border-b border-border/50 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <DynamicLogo subdomain={subdomain} size="sm" showText={true} />
        
        <div className="flex-1">
          <div className="font-black text-card-foreground text-base mb-0.5">
            {subdomain.split('-').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} Academy
          </div>
          <div className="text-xs text-muted-foreground font-medium">Parents Portal</div>
          <div className="flex items-center space-x-1 mt-0.5">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            <span className="text-[0.6rem] text-green-600 font-bold">Online</span>
          </div>
        </div>
      </div>
      <button className="p-3 rounded-2xl bg-muted/30 hover:bg-muted/50 transition-all duration-300 group">
        <Settings className="w-5 h-5 text-muted-foreground group-hover:rotate-90 transition-transform" />
      </button>
    </div>
  );
}; 