"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

import { adminFetch } from "@/app/lib/adminApi";

function safeAdminRedirect(path: string | null): string {
  if (path && path.startsWith("/admin") && !path.startsWith("/admin/login")) {
    return path;
  }
  return "/admin";
}

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = safeAdminRedirect(searchParams.get("redirect"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!process.env.NEXT_PUBLIC_API_URL && process.env.NODE_ENV === "production") {
        setError(
          "Set NEXT_PUBLIC_API_URL in Vercel to your Render backend URL, then redeploy."
        );
        setLoading(false);
        return;
      }

      const res = await adminFetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Invalid email or password");
        setLoading(false);
        return;
      }

      router.push(redirectTo);
      router.refresh();
    } catch {
      setError("Unable to connect to server. Make sure the backend is running.");
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#1a1a1a]">
              <span className="text-xl font-bold text-white">G</span>
            </div>
            <span className="text-2xl font-bold text-[#1a1a1a]">Galler</span>
          </Link>
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-sm">
          <h1 className="mb-2 text-2xl font-bold text-[#1a1a1a]">Admin Portal</h1>
          <p className="mb-8 text-sm text-gray-500">Sign in to manage your website content</p>

          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@gmail.com"
                required
                autoComplete="username"
                className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-[#1a1a1a] outline-none transition-colors focus:border-[var(--primary-orange)] focus:bg-white"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-[#1a1a1a] outline-none transition-colors focus:border-[var(--primary-orange)] focus:bg-white"
              />
            </div>

            {error ? (
              <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 rounded-xl bg-[var(--primary-orange)] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#b8451a] disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-gray-400">
          <Link href="/" className="hover:text-[var(--primary-orange)]">
            &larr; Back to website
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function AdminLogin() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
          <p className="text-sm text-gray-500">Loading…</p>
        </div>
      }
    >
      <AdminLoginForm />
    </Suspense>
  );
}
