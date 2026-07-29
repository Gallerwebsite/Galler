import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5001";

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("galler_admin_token")?.value;
  const contentType = request.headers.get("content-type");

  if (!contentType?.includes("multipart/form-data")) {
    return NextResponse.json({ message: "Expected multipart form data" }, { status: 400 });
  }

  try {
    const upstream = await fetch(`${API_URL}/api/upload/document`, {
      method: "POST",
      headers: {
        "Content-Type": contentType,
        ...(token ? { Cookie: `galler_admin_token=${token}` } : {}),
      },
      body: request.body,
      // Required when streaming a request body with fetch in Node.js
      duplex: "half",
    } as RequestInit);

    const data = (await upstream.json().catch(() => null)) as {
      message?: string;
      url?: string;
      fileName?: string;
    } | null;

    if (!upstream.ok) {
      return NextResponse.json(
        { message: data?.message || "Upload failed" },
        { status: upstream.status }
      );
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ message: "Upload failed" }, { status: 500 });
  }
}
