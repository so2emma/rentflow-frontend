/**
 * components/layout/Sidebar.tsx
 *
 * Shared sidebar shell used by all three dashboards.
 * Design per design.md:
 *   - Deep Slate (#0F172A) background
 *   - Active nav items: subtle left-border in Emerald Green + white text
 *   - Icons: thin-stroke (2px) monochrome inline SVGs
 *   - Sign-out button at bottom
 *   - z-index: sidebar (20)
 *
 * Usage:
 *   <Sidebar
 *     title="RentFlow"
 *     userLabel="Connected Landlord"
 *     userEmail="user@example.com"
 *     navItems={[{ id: 'properties', label: 'Properties', icon: <BuildingIcon /> }]}
 *     activeItem="properties"
 *     onNavChange={(id) => setActiveTab(id)}
 *     onSignOut={handleLogout}
 *   />
 */

'use client';

import React from 'react';

export interface SidebarNavItem {
  id: string;
  label: string;
  /** Thin-stroke SVG icon component (16×16 or 20×20). */
  icon?: React.ReactNode;
}

interface SidebarProps {
  title?: string;
  userLabel?: string;
  userEmail?: string;
  navItems: SidebarNavItem[];
  activeItem: string;
  onNavChange: (id: string) => void;
  onSignOut: () => void;
}

export function Sidebar({
  title = 'RentFlow',
  userLabel = 'Connected User',
  userEmail,
  navItems,
  activeItem,
  onNavChange,
  onSignOut,
}: SidebarProps) {
  return (
    <aside
      className="bg-brand-deep-slate text-on-primary rounded-md p-6 flex flex-col justify-between
                 lg:h-[calc(100vh-64px)] lg:sticky lg:top-8 shadow-sm z-sidebar"
    >
      {/* Top section */}
      <div>
        {/* Logo / brand */}
        <div className="text-xl font-bold tracking-tight mb-6 font-sans text-white select-none">
          {title}
        </div>

        {/* User info */}
        {userEmail && (
          <div className="mb-6 border-b border-white/10 pb-4">
            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
              {userLabel}
            </p>
            <strong className="block text-sm mt-1 truncate font-semibold text-white">
              {userEmail}
            </strong>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex flex-col gap-1" aria-label="Main navigation">
          {navItems.map((item) => {
            const isActive = activeItem === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavChange(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`
                  flex items-center gap-3 text-left px-3.5 py-2.5 rounded-sm font-semibold text-sm
                  transition-all duration-[150ms] ease-[cubic-bezier(0.4,0,0.2,1)]
                  outline-none focus-visible:ring-2 focus-visible:ring-focus-ring
                  focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900
                  ${isActive
                    ? 'bg-white/10 text-white border-l-4 border-brand-emerald-green'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white border-l-4 border-transparent'
                  }
                `}
              >
                {item.icon && (
                  <span className="flex-shrink-0 w-4 h-4" aria-hidden="true">
                    {item.icon}
                  </span>
                )}
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom — Sign out */}
      <button
        onClick={onSignOut}
        className="mt-6 flex items-center justify-center gap-2 bg-transparent border border-white/20
                   text-on-primary py-2.5 px-4 rounded-sm cursor-pointer font-semibold text-sm
                   hover:bg-white/10 transition-colors duration-[150ms] ease-[cubic-bezier(0.4,0,0.2,1)]
                   outline-none focus-visible:ring-2 focus-visible:ring-focus-ring
                   focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
      >
        {/* Sign out icon */}
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        Sign Out
      </button>
    </aside>
  );
}

/* ── Thin-stroke icons (2px stroke, monochrome) ─────────────────────────── */

export function BuildingIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 17V7l7-4 7 4v10" />
      <rect x="7" y="11" width="2" height="3" />
      <rect x="11" y="11" width="2" height="3" />
      <rect x="7" y="6" width="2" height="2" />
      <rect x="11" y="6" width="2" height="2" />
    </svg>
  );
}

export function KeyIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="8" r="4" />
      <path d="M12 12l6 6" />
      <path d="M16 14l-1 1" />
    </svg>
  );
}

export function GridIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="6" height="6" />
      <rect x="11" y="3" width="6" height="6" />
      <rect x="3" y="11" width="6" height="6" />
      <rect x="11" y="11" width="6" height="6" />
    </svg>
  );
}

export function DocumentIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 3H7a2 2 0 00-2 2v10a2 2 0 002 2h6a2 2 0 002-2V7l-4-4z" />
      <path d="M13 3v4h4" />
      <path d="M7 11h6M7 13h4" />
    </svg>
  );
}

export function UsersIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 14s-1-2-4-2-4 2-4 2" />
      <circle cx="10" cy="8" r="3" />
      <path d="M17 14s-.5-1.5-2.5-2" />
      <circle cx="15.5" cy="7" r="2" />
    </svg>
  );
}

export function ChartIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 16l4-5 4 3 4-7" />
      <path d="M3 17h14" />
    </svg>
  );
}

export function SettingsIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10" cy="10" r="3" />
      <path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.22 4.22l1.42 1.42M14.36 14.36l1.42 1.42M4.22 15.78l1.42-1.42M14.36 5.64l1.42-1.42" />
    </svg>
  );
}
