import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { ADMIN_COOKIE_NAME } from "@/app/lib/adminAuth.constants";

export const runtime = "nodejs";

/** Returns the admin JWT so the client can upload large files directly to Render (bypasses Vercel's ~4.5MB body limit). */
export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  return NextResponse.json({ token });
}
