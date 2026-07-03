'use client';

import React from 'react';

interface TopAppBarProps {
  onMenuClick: () => void;
  userEmail?: string;
}

export function TopAppBar({ onMenuClick, userEmail }: TopAppBarProps) {
  return (
    <header className="bg-surface dark:bg-surface-dim text-on-surface fixed top-0 right-0 h-16 w-full lg:w-[calc(100%-260px)] z-40 border-b border-outline-variant flex justify-between items-center px-margin-mobile lg:px-margin-desktop font-body-md text-body-md">
      <div className="flex items-center gap-4">
        {/* Mobile Menu Button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden text-on-surface-variant hover:bg-surface-container-high rounded-full p-2 transition-colors ripple outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
          aria-label="Open sidebar"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>

        {/* Search Bar (Hidden on very small screens, visible on md+) */}
        <div className="hidden md:flex items-center gap-2 bg-surface-container-low rounded-full px-4 py-2 w-80 border border-outline-variant focus-within:border-primary-fixed-dim transition-colors">
          <span className="material-symbols-outlined text-on-surface-variant text-[20px]">search</span>
          <input
            className="bg-transparent border-none focus:ring-0 text-body-md p-0 w-full text-on-surface placeholder:text-on-surface-variant outline-none"
            placeholder="Search transactions..."
            type="text"
          />
        </div>
      </div>

      {/* Trailing Actions */}
      <div className="flex items-center gap-2">
        <button className="text-on-surface-variant hover:bg-surface-container-high rounded-full p-2 transition-colors relative ripple outline-none focus-visible:ring-2 focus-visible:ring-focus-ring" aria-label="Notifications">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full border border-surface"></span>
        </button>
        <button className="text-on-surface-variant hover:bg-surface-container-high rounded-full p-2 transition-colors ripple outline-none focus-visible:ring-2 focus-visible:ring-focus-ring" aria-label="User Profile" title={userEmail}>
          <span className="material-symbols-outlined">account_circle</span>
        </button>
      </div>
    </header>
  );
}
