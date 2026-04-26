import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(url, { method: "HEAD", signal: controller.signal });
    clearTimeout(timeout);
    return NextResponse.json({ live: res.ok, status: res.status });
  } catch {
    return NextResponse.json({ live: false, status: 0 });
  }
}
