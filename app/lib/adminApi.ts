/** Same-origin proxy to the backend — sends httpOnly auth cookie with every request. */
import { API_URL } from "@/app/lib/apiUrl";

const ADMIN_API_BASE = "/api-backend";

export function adminFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = path.startsWith("http") ? path : `${ADMIN_API_BASE}${normalizedPath}`;

  return fetch(url, {
    ...init,
    credentials: "include",
  });
}

async function getAdminUploadToken(): Promise<string> {
  const res = await fetch("/api/auth/token", { credentials: "include" });
  const data = (await res.json().catch(() => null)) as { token?: string; message?: string } | null;

  if (!res.ok || !data?.token) {
    throw new Error(data?.message || "Not authenticated");
  }

  return data.token;
}

/** Upload multipart files directly to Render — avoids Vercel's ~4.5MB serverless body limit. */
export async function adminUpload(path: string, formData: FormData): Promise<Response> {
  const token = await getAdminUploadToken();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return fetch(`${API_URL}${normalizedPath}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });
}
