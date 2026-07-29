"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { API_URL } from "@/app/lib/apiUrl";

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("This unsubscribe link is invalid.");
      return;
    }

    let cancelled = false;

    async function unsubscribe() {
      setStatus("loading");

      try {
        const res = await fetch(`${API_URL}/api/newsletter/unsubscribe`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        const data = await res.json().catch(() => ({}));

        if (cancelled) return;

        if (!res.ok) {
          setStatus("error");
          setMessage(data.message || "Unable to unsubscribe. Please contact support.");
          return;
        }

        setStatus("success");
        setMessage(data.message || "You have been unsubscribed.");
      } catch {
        if (!cancelled) {
          setStatus("error");
          setMessage("Something went wrong. Please try again later.");
        }
      }
    }

    unsubscribe();

    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5f5f5] px-6 py-16">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
        <h1 className="font-cinzel text-[28px] font-normal text-[#1a1a1a]">Newsletter</h1>

        {status === "loading" ? (
          <p className="mt-6 font-century text-[15px] text-gray-500">Processing your request…</p>
        ) : (
          <p
            className={`mt-6 font-century text-[15px] leading-relaxed ${
              status === "success" ? "text-green-700" : status === "error" ? "text-red-600" : "text-gray-600"
            }`}
          >
            {message}
          </p>
        )}

        <Link
          href="/"
          className="mt-8 inline-flex rounded-md bg-[#0b1f4a] px-6 py-3 font-century text-[15px] font-semibold text-white transition-colors hover:bg-[#0a1840]"
        >
          Back to Home
        </Link>
      </div>
    </main>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#f5f5f5] px-6 py-16">
          <p className="font-century text-[15px] text-gray-500">Loading…</p>
        </main>
      }
    >
      <UnsubscribeContent />
    </Suspense>
  );
}
