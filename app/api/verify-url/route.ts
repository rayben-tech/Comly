import { NextRequest, NextResponse } from "next/server";
import { isPrivateUrl } from "@/lib/validate-url";

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    if (!url || isPrivateUrl(url)) {
      return NextResponse.json({ live: false, status: 0 });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const headers = {
      "User-Agent": "Mozilla/5.0 (compatible; Comly-URLChecker/1.0)",
      Accept: "text/html,application/xhtml+xml,*/*",
    };

    try {
      let res = await fetch(url, { method: "HEAD", signal: controller.signal, headers });

      // Some servers reject HEAD — fall back to GET
      if (res.status === 405 || res.status === 501) {
        res = await fetch(url, { method: "GET", signal: controller.signal, headers });
      }

      clearTimeout(timeout);
      const status = res.status;

      // 401/403 = site exists but blocks access — count as live
      const live = res.ok || status === 401 || status === 403 || status === 301 || status === 302;
      return NextResponse.json({ live, status });
    } catch (err: unknown) {
      clearTimeout(timeout);
      const isTimeout = err instanceof Error && err.name === "AbortError";
      return NextResponse.json({ live: false, status: isTimeout ? -1 : 0 });
    }
  } catch {
    return NextResponse.json({ live: false, status: 0 });
  }
}
