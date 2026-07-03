'use client';

import React from 'react';

interface TopAppBarProps {
  onMenuClick: () => void;
  userEmail?: string;
  userRole?: string;
}

export function TopAppBar({ onMenuClick, userEmail, userRole }: TopAppBarProps) {
  return (
      <header className="bg-white fixed top-0 right-0 h-16 w-full lg:w-[calc(100%-260px)] z-40 border-b border-gray-200 flex justify-between items-center px-4 lg:px-8">
        {/* Left: Menu & Search */}
        <div className="flex items-center gap-4 flex-1">
          <button
              onClick={onMenuClick}
              className="lg:hidden text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-colors"
              aria-label="Open sidebar"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>

          <div className="flex items-center bg-gray-100 rounded-full px-4 py-2 w-full max-w-sm border border-transparent focus-within:border-gray-300 transition-colors">
            <span className="material-symbols-outlined text-gray-400 text-[20px] mr-2">search</span>
            <input
                className="bg-transparent border-none focus:ring-0 text-sm w-full text-gray-900 placeholder:text-gray-500 outline-none"
                placeholder="Search properties or tenants..."
                type="text"
            />
          </div>
        </div>

        {/* Right: Notifications & User Profile */}
        <div className="flex items-center gap-4">
          {/* Notification */}
          <button className="text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-colors relative" aria-label="Notifications">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-600 rounded-full border-2 border-white"></span>
          </button>

          {/* Separator */}
          <div className="h-8 w-px bg-gray-300"></div>

          {/* User Profile */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-gray-900 leading-tight">{userEmail ?? "Akpasubi Michael"}</p>
              <p className="text-[10px] text-gray-500 font-semibold tracking-wide uppercase">{userRole ?? "Unit 204B"}</p>
            </div>
            <img
                src={"/images/userImage.png"}
                alt={userEmail}
                className="w-10 h-10 rounded-full object-cover border-2 border-emerald-400 p-0.5"
            />
          </div>
        </div>
      </header>
  );
}
