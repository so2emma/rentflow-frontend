/**
 * components/layout/DashboardShell.tsx
 *
 * Wrapper layout for all dashboard pages. Includes responsive Sidebar and TopAppBar.
 */
'use client';

import React, { useState } from 'react';
import { Sidebar, SidebarNavItem } from './Sidebar';
import { TopAppBar } from './TopAppBar';

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
  sidebarTitle = 'RentFlow',
  userLabel = 'Management Portal',
  userEmail,
  navItems,
  activeItem,
  onNavChange,
  onSignOut,
  children,
}: DashboardShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex w-full h-screen overflow-hidden bg-background">
      {/* Sidebar - fixed on desktop, drawer on mobile */}
      <Sidebar
        title={sidebarTitle}
        userLabel={userLabel}
        userEmail={userEmail}
        navItems={navItems}
        activeItem={activeItem}
        onNavChange={onNavChange}
        onSignOut={onSignOut}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col lg:ml-[260px] relative overflow-y-auto w-full">
        {/* Top App Bar */}
        <TopAppBar 
          onMenuClick={() => setIsSidebarOpen(true)}
          userEmail={userEmail}
        />

        {/* Page Content */}
        <div className="flex-1 pt-16">
          <div className="p-margin-mobile lg:p-margin-desktop w-full max-w-container-max mx-auto space-y-stack-lg">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
