import { NextRequest, NextResponse } from "next/server";

async function scrapeWithFirecrawl(url: string, apiKey: string) {
  const response = await fetch("https://api.firecrawl.dev/v1/scrape", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      url,
      formats: ["markdown"],
      onlyMainContent: true,
    }),
  });

  const text = await response.text();
  if (!response.ok) {
    console.warn("Firecrawl failed, will try fallback. Status:", response.status, text.slice(0, 200));
    return null;
  }

  const data = JSON.parse(text);
  const markdown = data?.data?.markdown;
  if (!data.success || !markdown) return null;

  return {
    content: markdown.slice(0, 12000),
    title: data.data?.metadata?.title || "",
    description: data.data?.metadata?.description || "",
  };
}

async function scrapeWithFallback(url: string) {
  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const html = await response.text();

  const titleMatch = html.match(/<title[^>]*>([^<]{1,200})<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : "";

  const descMatch = html.match(
    /<meta[^>]*name=["']description["'][^>]*content=["']([^"']{1,400})/i
  ) || html.match(
    /<meta[^>]*content=["']([^"']{1,400})["'][^>]*name=["']description["']/i
  );
  const description = descMatch ? descMatch[1].trim() : "";

  const content = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<nav[\s\S]*?<\/nav>/gi, "")
    .replace(/<footer[\s\S]*?<\/footer>/gi, "")
    .replace(/<header[\s\S]*?<\/header>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s{2,}/g, " ")
    .trim()
    .slice(0, 12000);

  if (content.length < 100) {
    throw new Error("Too little content extracted");
  }

  return { content, title, description };
}

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const apiKey = process.env.FIRECRAWL_API_KEY;

    // Try Firecrawl first if key is present
    if (apiKey) {
      const firecrawlResult = await scrapeWithFirecrawl(url, apiKey).catch(
        (e) => { console.warn("Firecrawl threw:", e); return null; }
      );
      if (firecrawlResult) return NextResponse.json(firecrawlResult);
    }

    // Fallback: direct fetch + HTML strip
    console.log("Using fallback scraper for:", url);
    const fallbackResult = await scrapeWithFallback(url);
    return NextResponse.json(fallbackResult);
  } catch (err) {
    console.error("Scrape error:", err);
    return NextResponse.json(
      {
        error:
          "Could not access this website. Make sure the URL is correct and the site is publicly accessible.",
      },
      { status: 500 }
    );
  }
}
