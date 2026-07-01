/**
 * components/layout/DashboardShell.tsx
 *
 * Full-page shell for authenticated dashboard routes.
 * Composes Sidebar + main content area in the 12-column grid:
 *   - Fixed 260px sidebar on desktop (lg+)
 *   - Single-column stack on mobile (sidebar collapses below grid)
 *   - Max width 1440px, centered
 *
 * Per architecture.md: route files (page.tsx) should be thin —
 * they pass nav config and render feature content inside this shell.
 */

'use client';

import React from 'react';
import { Sidebar, SidebarNavItem } from './Sidebar';

interface DashboardShellProps {
  sidebarTitle?: string;
  userLabel?: string;
  userEmail?: string;
  navItems: SidebarNavItem[];
  activeItem: string;
  onNavChange: (id: string) => void;
  onSignOut: () => void;
  children: React.ReactNode;
}

export function DashboardShell({
  sidebarTitle,
  userLabel,
  userEmail,
  navItems,
  activeItem,
  onNavChange,
  onSignOut,
  children,
}: DashboardShellProps) {
  return (
    <div
      className="max-w-[1440px] mx-auto p-4 md:p-8 min-h-screen bg-background
                 grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6"
    >
      {/* Sidebar — hidden on mobile, shown on lg+ */}
      <div className="hidden lg:block">
        <Sidebar
          title={sidebarTitle}
          userLabel={userLabel}
          userEmail={userEmail}
          navItems={navItems}
          activeItem={activeItem}
          onNavChange={onNavChange}
          onSignOut={onSignOut}
        />
      </div>

      {/* Mobile top bar — shown below lg */}
      <div className="lg:hidden flex items-center justify-between bg-brand-deep-slate text-white rounded-md px-4 py-3">
        <span className="font-bold text-base tracking-tight">{sidebarTitle ?? 'RentFlow'}</span>
        <button
          onClick={onSignOut}
          className="text-sm font-semibold text-slate-300 hover:text-white transition-colors duration-[150ms]
                     outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-1
                     focus-visible:ring-offset-slate-900 rounded px-2 py-1"
        >
          Sign Out
        </button>
      </div>

      {/* Main content */}
      <main className="flex flex-col gap-6 min-w-0">
        {children}
      </main>
    </div>
  );
}
