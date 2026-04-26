import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    if (!url) return NextResponse.json({ live: false, status: 0 });

    const base = (url.startsWith("http") ? url : `https://${url}`).replace(/\/$/, "");
    const targetUrl = `${base}/llms.txt`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    try {
      const res = await fetch(targetUrl, { method: "HEAD", signal: controller.signal });
      clearTimeout(timeout);
      return NextResponse.json({ live: res.ok, status: res.status });
    } catch {
      clearTimeout(timeout);
      return NextResponse.json({ live: false, status: 0 });
    }
  } catch {
    return NextResponse.json({ live: false, status: 0 });
  }
}
