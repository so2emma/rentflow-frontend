"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getDashboardPath, isAuthenticated } from "@/lib/auth/session";
import LandingPage from "@/components/features/landing/LandingPage";

export default function Home() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (isAuthenticated()) {
      router.replace(getDashboardPath());
    } else {
      setChecking(false);
    }
  }, [router]);

  if (checking) {
    return (
      <div className="w-full flex items-center justify-center min-h-screen bg-background">
        <h2 className="text-xl font-semibold animate-pulse text-primary">Loading RentFlow…</h2>
      </div>
    );
  }

  return <LandingPage />;
}
