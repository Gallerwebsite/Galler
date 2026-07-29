import { cookies } from "next/headers";

import { ADMIN_COOKIE_NAME } from "@/app/lib/adminAuth.constants";

export { ADMIN_COOKIE_NAME } from "@/app/lib/adminAuth.constants";

export async function verifyAdminSession(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (!token) return false;

  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5001";

  try {
    const res = await fetch(`${apiUrl}/api/auth/verify`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    if (!res.ok) return false;

    const data = await res.json().catch(() => ({}));
    return data.valid === true;
  } catch {
    return false;
  }
}
