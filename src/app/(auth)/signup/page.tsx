"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { signUp } from "@/lib/api/auth";
import type { ApiErrorResponse } from "@/lib/api/client";

import { Button } from "@/components/ui/Button";
import { AuthShell } from "@/components/auth/AuthShell";

const INPUT_CLS =
    "w-full min-h-[44px] px-3.5 py-2.5 text-base border border-outline-variant rounded " +
    "bg-surface-container-lowest text-on-surface outline-none " +
    "transition-colors duration-[150ms] " +
    "focus:border-tertiary focus:ring-2 focus:ring-focus-ring focus:ring-offset-2 " +
    "disabled:opacity-50 disabled:cursor-not-allowed";

function Field({
                 label,
                 htmlFor,
                 error,
                 hint,
                 children,
               }: {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
      <div className="flex flex-col gap-1.5">
        <label
            htmlFor={htmlFor}
            className="text-sm font-semibold text-on-surface"
        >
          {label}
        </label>

        {children}

        {error && (
            <p
                role="alert"
                className="flex items-center gap-1 text-sm text-on-error-container"
            >
              <svg
                  className="h-4 w-4 flex-shrink-0 text-error"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
              >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                />
              </svg>

              {error}
            </p>
        )}

        {!error && hint && (
            <p className="text-xs text-on-surface-variant">
              {hint}
            </p>
        )}
      </div>
  );
}

type Role = "ADMIN" | "LANDLORD" | "TENANT";

export default function SignUpPage() {
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const [role, setRole] = useState<Role>("TENANT");

  const [bankCode, setBankCode] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [bankAccountName, setBankAccountName] = useState("");

  const [bvn, setBvn] = useState("");

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);

  function validate() {
    const errs: Record<string, string> = {};

    if (!firstName.trim()) errs.firstName = "First name is required.";
    if (!lastName.trim()) errs.lastName = "Last name is required.";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email))
      errs.email = "Enter a valid email address.";

    if (password.length < 6)
      errs.password = "Password must be at least 6 characters.";

    if (!phoneNumber.trim())
      errs.phoneNumber = "Phone number is required.";

    if (role === "LANDLORD") {
      if (!bankCode)
        errs.bankCode = "Please select your settlement bank.";

      if (!/^\d{10}$/.test(bankAccountNumber))
        errs.bankAccountNumber =
            "Account number must be exactly 10 digits.";

      if (!bankAccountName.trim())
        errs.bankAccountName = "Account name is required.";
    }

    if (role === "TENANT") {
      if (!/^\d{11}$/.test(bvn))
        errs.bvn = "BVN must be exactly 11 digits.";
    }

    setFieldErrors(errs);

    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(
      e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setGlobalError(null);

    if (!validate()) return;

    setIsLoading(true);

    const payload: Record<string, unknown> = {
      email,
      password,
      role,
      firstName,
      lastName,
      phoneNumber,
    };

    if (role === "LANDLORD") {
      payload.landlordDetails = {
        bankCode,
        bankAccountNumber,
        bankAccountName,
      };
    }

    if (role === "TENANT") {
      payload.tenantDetails = { bvn };
    }

    try {
      await signUp(payload as any);

      router.push("/login?signup_success=true");
    } catch (error) {
      const err = error as ApiErrorResponse;

      if (err.errors) {
        setFieldErrors((prev) => ({
          ...prev,
          ...err.errors,
        }));
      } else {
        setGlobalError(
            err.message ??
            "Sign up failed. Please try again."
        );
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
      <AuthShell
          title="Create Account"
          subtitle="Register your RentFlow portal profile"
      >
        <form
            onSubmit={handleSubmit}
            noValidate
            className="flex flex-col gap-5"
        >
          {globalError && (
              <div className="rounded-md border border-error/20 bg-error-container p-3 text-sm text-on-error-container">
                {globalError}
              </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
                label="First Name"
                htmlFor="firstName"
                error={fieldErrors.firstName}
            >
              <input
                  id="firstName"
                  className={INPUT_CLS}
                  value={firstName}
                  onChange={(e) =>
                      setFirstName(e.target.value)
                  }
                  disabled={isLoading}
              />
            </Field>

            <Field
                label="Last Name"
                htmlFor="lastName"
                error={fieldErrors.lastName}
            >
              <input
                  id="lastName"
                  className={INPUT_CLS}
                  value={lastName}
                  onChange={(e) =>
                      setLastName(e.target.value)
                  }
                  disabled={isLoading}
              />
            </Field>
          </div>

          <Field
              label="Email Address"
              htmlFor="email"
              error={fieldErrors.email}
          >
            <input
                id="email"
                type="email"
                className={INPUT_CLS}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
                label="Password"
                htmlFor="password"
                error={fieldErrors.password}
                hint="At least 6 characters"
            >
              <input
                  id="password"
                  type="password"
                  className={INPUT_CLS}
                  value={password}
                  onChange={(e) =>
                      setPassword(e.target.value)
                  }
                  disabled={isLoading}
              />
            </Field>

            <Field
                label="Phone Number"
                htmlFor="phone"
                error={fieldErrors.phoneNumber}
            >
              <input
                  id="phone"
                  className={INPUT_CLS}
                  value={phoneNumber}
                  onChange={(e) =>
                      setPhoneNumber(e.target.value)
                  }
                  disabled={isLoading}
              />
            </Field>
          </div>

          <Field label="Registering As" htmlFor="role">
            <select
                id="role"
                className={`${INPUT_CLS} cursor-pointer`}
                value={role}
                onChange={(e) => {
                  setRole(e.target.value as Role);
                  setFieldErrors({});
                }}
            >
              <option value="TENANT">Tenant</option>
              <option value="LANDLORD">Landlord</option>
              <option value="ADMIN">Administrator</option>
            </select>
          </Field>

          {/* Keep your LANDLORD and TENANT conditional sections exactly as they are */}

          <Button
              type="submit"
              loading={isLoading}
              className="w-full"
          >
            {isLoading
                ? "Creating Account..."
                : "Sign Up"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-on-surface-variant">
          Already have an account?{" "}
          <Link
              href="/login"
              className="font-semibold text-brand-blue hover:underline"
          >
            Sign In
          </Link>
        </p>
      </AuthShell>
  );
}
