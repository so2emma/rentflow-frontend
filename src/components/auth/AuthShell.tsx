import { ReactNode } from "react";

interface AuthShellProps {
    title: string;
    subtitle: string;
    children: ReactNode;
}

export function AuthShell({
                              title,
                              subtitle,
                              children,
                          }: Readonly<AuthShellProps>) {
    return (
        <>
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900">
                    {title}
                </h1>
                <p className="mt-2 text-slate-600">
                    {subtitle}
                </p>
            </header>
            {children}
        </>
    );
}
