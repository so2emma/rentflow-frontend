import type { ReactNode } from "react";
import {BrandingPanel} from "@/components/auth/BrandingPanel";

function ShieldIcon() {
    return (
        <svg
            className="w-5 h-5 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
        </svg>
    );
}

export default function AuthLayout({children,}: Readonly<{ children: ReactNode}>) {
    return (
            <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 w-full">
                <BrandingPanel />
                <main className="flex items-center justify-center p-8 bg-slate-50">
                    <div className="w-full max-w-[420px]">
                        {children}
                    </div>
                </main>
            </div>
    );
}
