"use client";

import React, { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { login } from "@/lib/api/auth";
import {
  getDashboardPath,
  setSession,
} from "@/lib/auth/session";
import { Button } from "@/components/ui/Button";
import { EyeIcon, EyeOff } from "lucide-react";
import { AuthShell } from "@/components/auth/AuthShell";

const INPUT_CLS =
    "w-full min-h-[44px] px-3.5 py-2.5 text-base border border-outline-variant rounded " +
    "bg-surface-container-lowest text-on-surface outline-none focus:border-tertiary " +
    "focus:ring-2 focus:ring-focus-ring transition-colors";

function LoginContent() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<"landlord" | "tenant">("landlord");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(
      e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setIsLoading(true);
    setError(null);

    try {
      const response = await login({
        email,
        password,
      });

      setSession(response.token, {
        email: response.email,
        roles: response.roles,
      });

      router.replace(getDashboardPath());
    } catch (err: any) {
      setError(err.message ?? "Login failed.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
      <AuthShell
          title="Welcome Back"
          subtitle="Access your real estate portfolio dashboard."
      >
        <div className="flex bg-slate-100 p-1 rounded-lg mb-6">
          <button
              onClick={() => setRole("landlord")}
              className={`flex-1 py-2 rounded-md text-sm font-semibold transition ${
                  role === "landlord"
                      ? "bg-white shadow text-slate-900"
                      : "text-slate-500"
              }`}
          >
            Landlord
          </button>

          <button
              onClick={() => setRole("tenant")}
              className={`flex-1 py-2 rounded-md text-sm font-semibold transition ${
                  role === "tenant"
                      ? "bg-white shadow text-slate-900"
                      : "text-slate-500"
              }`}
          >
            Tenant
          </button>
        </div>

        <form
            onSubmit={handleSubmit}
            className="space-y-4"
        >
          {error && (
              <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
          )}

          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Email Address
            </label>

            <input
                className={INPUT_CLS}
                value={email}
                onChange={(e) =>
                    setEmail(e.target.value)
                }
                placeholder="name@company.com"
                type="email"
                required
            />
          </div>

          <div>
            <div className="mb-1.5 flex justify-between">
              <label className="text-sm font-medium">
                Password
              </label>

              <Link
                  href="/forgot-password"
                  className="text-sm text-emerald-700"
              >
                Forgot password?
              </Link>
            </div>

            <div className="relative">
              <input
                  className={INPUT_CLS}
                  value={password}
                  onChange={(e) =>
                      setPassword(e.target.value)
                  }
                  type={
                    showPassword
                        ? "text"
                        : "password"
                  }
                  required
              />

              <button
                  type="button"
                  onClick={() =>
                      setShowPassword(!showPassword)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showPassword ? (
                    <EyeIcon className="w-5 h-5" />
                ) : (
                    <EyeOff className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <Button
              loading={isLoading}
              className="w-full"
          >
            Sign In
          </Button>
        </form>

        <p className="mt-8 text-center text-sm">
          Don't have an account?{" "}
          <Link
              href="/signup"
              className="font-semibold text-emerald-700"
          >
            Sign Up
          </Link>
        </p>
      </AuthShell>
  );
}

export default function LoginPage() {
  return (
      <Suspense fallback={<div>Loading...</div>}>
        <LoginContent />
      </Suspense>
  );
}
