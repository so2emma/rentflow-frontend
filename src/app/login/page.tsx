"use client";

import Link from 'next/link';

export default function LoginPageRedirect() {
  return (
    <div className="w-full min-h-screen bg-[#070a13] text-white flex flex-col justify-center items-center p-6 relative overflow-hidden">
      
      {/* Glow Effects */}
      <div className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(white 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      ></div>
      <div className="absolute top-1/4 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-[440px] bg-slate-900/40 border border-slate-800/80 backdrop-blur-md rounded-xl p-8 shadow-2xl flex flex-col gap-6 relative z-10 text-center">
        
        {/* Brand */}
        <div className="flex flex-col items-center gap-2 select-none">
          <span className="material-symbols-outlined text-emerald-400 text-[36px] leading-none" aria-hidden="true">
            real_estate_agent
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-white">RentFlow Portal Sign In</h1>
          <p className="text-sm text-slate-400">Please choose which account portal you want to sign in to:</p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-4 mt-2">
          <Link
            href="/landlord/login"
            className="w-full min-h-[48px] rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center justify-center gap-2 transition-all shadow-md active:scale-98"
          >
            <span className="material-symbols-outlined text-[20px]">real_estate_agent</span>
            Landlord Portal Login
          </Link>
          
          <Link
            href="/tenant/login"
            className="w-full min-h-[48px] rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold flex items-center justify-center gap-2 transition-all border border-slate-700 shadow-sm active:scale-98"
          >
            <span className="material-symbols-outlined text-[20px]">sensor_occupied</span>
            Tenant Portal Login
          </Link>
        </div>

        <div className="border-t border-slate-800/80 pt-4 mt-2">
          <Link href="/" className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold hover:underline inline-flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">arrow_back</span>
            Back to Home
          </Link>
        </div>

      </div>

      <div className="mt-8 text-xs text-slate-500 font-mono">
        &copy; {new Date().getFullYear()} RentFlow Inc. All rights reserved.
      </div>

    </div>
  );
}
