import { NextResponse } from "next/server";

const BACKEND_API_URL = process.env.ADAPTIVE_HEALTH_API_URL || "http://127.0.0.1:8787";

export async function POST() {
  const response = await fetch(`${BACKEND_API_URL}/api/advance-day`, {
    method: "POST",
    cache: "no-store",
  });
  const body = await response.text();

  return new NextResponse(body, {
    status: response.status,
    headers: { "Content-Type": response.headers.get("Content-Type") || "application/json" },
  });
}

