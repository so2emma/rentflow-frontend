import type { ReactNode } from "react";
import {BrandingPanel} from "@/components/auth/BrandingPanel";

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
