/**
 * components/layout/Sidebar.tsx
 *
 * Shared sidebar shell used by all three dashboards.
 * Redesigned to use fixed left-0 structure, Material Icons, and the new color palette.
 */

'use client';

import React from 'react';
import {NavItemType, sidebarData} from "@/utils/constants/sidebarData";

export interface SidebarNavItem {
  id: string;
  label: string;
  icon: string;
}

interface SidebarProps {
  title?: string;
  userLabel?: string;
  userEmail?: string;
  sidebarData: NavItemType;
  activeItem: string;
  onNavChange: (id: string) => void;
  onSignOut: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({
  title = 'RentFlow',
  userLabel = 'Management Portal',
  userEmail,
  sidebarData,
  activeItem,
  onNavChange,
  onSignOut,
  isOpen,
  onClose,
}: Readonly<SidebarProps>) {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-primary-container/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <nav
        className={`bg-primary-container w-sidebar-width h-screen fixed left-0 top-0 border-r border-outline-variant flex flex-col gap-stack-md py-stack-lg z-50 transition-transform duration-slow ease-standard
                    ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                  `}
      >
        {/* Header */}
        <div className="px-6 pb-2 flex justify-between items-start">
          <div>
            <div className="font-display-lg text-headline-md font-bold text-on-primary tracking-tight">
              {title}
            </div>
            <div className="text-on-primary-container font-label-md text-[10px] uppercase tracking-wider mt-1">
              {userLabel}
            </div>
            {userEmail && (
              <div className="text-on-primary-container font-body-md text-[11px] truncate mt-1">
                {userEmail}
              </div>
            )}
          </div>
          <button
            className="lg:hidden text-on-primary-container hover:text-on-primary p-1"
            onClick={onClose}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex flex-col flex-1 mt-4">
          {sidebarData.navMain.map((item) => {
            const isActive = activeItem === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavChange(item.id);
                  onClose();
                }}
                className={`
                  flex items-center gap-3 px-6 py-3 font-label-md text-label-md text-left transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-inset
                  ${isActive
                    ? 'text-secondary-fixed font-bold border-l-4 border-secondary-fixed bg-on-primary-fixed-variant/10 scale-[0.98]'
                    : 'text-on-primary-container opacity-70 hover:bg-on-primary-fixed-variant/20 hover:text-on-primary border-l-4 border-transparent'
                  }
                `}
                aria-current={isActive ? 'page' : undefined}
              >
                <span
                  className="material-symbols-outlined text-[20px]"
                  style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                  aria-hidden="true"
                >
                  {item.icon}
                </span>
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-auto pt-4 border-t border-on-primary-container/20">
          <button
            onClick={onSignOut}
            className="w-full flex items-center gap-3 px-6 py-3 text-on-primary-container opacity-70 hover:bg-on-primary-fixed-variant/20 hover:text-on-primary transition-colors font-label-md text-label-md text-left outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-inset"
          >
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 0" }}>
              logout
            </span>
            Sign Out
          </button>
        </div>
      </nav>
    </>
  );
}
