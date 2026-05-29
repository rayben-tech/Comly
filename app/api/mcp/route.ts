import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { BrandProfile, PromptResult } from "@/types";

export const maxDuration = 30;
export const dynamic = "force-dynamic";

// ── types ────────────────────────────────────────────────────────────────────

interface AuditResults {
  score: number;
  total_mentions: number;
  prompt_results: PromptResult[];
  competitor_rankings: Array<{ name: string; domain: string; mention_count: number; avg_position: number | null }>;
}

interface AuditRow {
  brand_name: string;
  url: string;
  score: number;
  profile: BrandProfile;
  results: AuditResults;
  threads_cache?: {
    reddit?: Thread[];
    quora?: Thread[];
    cached_at?: string;
  };
}

interface Thread {
  id?: string;
  title: string;
  url: string;
  subreddit?: string;
  upvotes?: number;
  comments?: number;
}

// ── MCP helpers ──────────────────────────────────────────────────────────────

function ok(id: unknown, result: unknown) {
  return NextResponse.json({ jsonrpc: "2.0", id, result });
}

function err(id: unknown, code: number, message: string) {
  return NextResponse.json({ jsonrpc: "2.0", id, error: { code, message } });
}

// ── tools ────────────────────────────────────────────────────────────────────

const TOOLS = [
  {
    name: "find_threads",
    description: "Find relevant Reddit and Quora threads where potential customers are asking about problems your brand solves. Returns threads with titles and URLs ready to engage with.",
    inputSchema: {
      type: "object",
      properties: {
        platform: {
          type: "string",
          enum: ["all", "reddit", "quora"],
          description: "Which platform to search. Defaults to 'all'.",
        },
      },
      required: [],
    },
  },
  {
    name: "get_visibility_score",
    description: "Get your brand's current AI visibility score — how often you appear when people ask ChatGPT, Claude, Gemini or Perplexity about your category. Returns score (0–100), mention count, and a plain-English summary.",
    inputSchema: { type: "object", properties: {}, required: [] },
  },
  {
    name: "get_prompt_results",
    description: "See every AI prompt tested in your latest audit — whether your brand was mentioned, at what position, and which competitors appeared instead.",
    inputSchema: {
      type: "object",
      properties: {
        filter: {
          type: "string",
          enum: ["all", "mentioned", "not_mentioned"],
          description: "Filter by mention status. Defaults to 'all'.",
        },
      },
      required: [],
    },
  },
  {
    name: "get_competitor_rankings",
    description: "See which competitors AI models mention most often across all audit prompts, ranked by mention count.",
    inputSchema: { type: "object", properties: {}, required: [] },
  },
];

// ── thread helpers ───────────────────────────────────────────────────────────

function isFresh(cachedAt?: string): boolean {
  if (!cachedAt) return false;
  return Date.now() - new Date(cachedAt).getTime() < 24 * 60 * 60 * 1000;
}

async function fetchThreadsLive(
  profile: BrandProfile,
  baseUrl: string,
  userId: string,
  supabase: ReturnType<typeof createClient>
): Promise<{ reddit: Thread[]; quora: Thread[] }> {
  const [redditRes, quoraRes] = await Promise.allSettled([
    fetch(`${baseUrl}/api/engagement-threads`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profile }),
    }).then((r) => r.json()),
    fetch(`${baseUrl}/api/quora-threads`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profile }),
    }).then((r) => r.json()),
  ]);

  const reddit = redditRes.status === "fulfilled" ? (redditRes.value.threads ?? []) : [];
  const quora  = quoraRes.status  === "fulfilled" ? (quoraRes.value.threads  ?? []) : [];

  // Save to cache
  await supabase.from("audits").update({
    threads_cache: { reddit, quora, cached_at: new Date().toISOString() },
  }).eq("user_id", userId);

  return { reddit, quora };
}

// ── tool handlers ────────────────────────────────────────────────────────────

function handleFindThreads(
  reddit: Thread[],
  quora: Thread[],
  platform: string,
  fromCache: boolean
) {
  const redditOut = reddit.map((t) => ({
    platform: "Reddit",
    subreddit: t.subreddit ?? "reddit",
    title: t.title,
    url: t.url,
  }));
  const quoraOut = quora.map((t) => ({
    platform: "Quora",
    title: t.title,
    url: t.url,
  }));

  const combined =
    platform === "reddit" ? redditOut :
    platform === "quora"  ? quoraOut  :
    [...redditOut, ...quoraOut];

  return {
    total: combined.length,
    source: fromCache ? "cached" : "live",
    threads: combined,
  };
}

function handleGetScore(audit: AuditRow) {
  const { score, results, profile } = audit;
  const mentioned  = results.prompt_results.filter((r) => r.mentioned).length;
  const total      = results.prompt_results.length;
  const grade      = score >= 80 ? "A" : score >= 65 ? "B" : score >= 50 ? "C" : score >= 35 ? "D" : "F";
  const topComp    = results.competitor_rankings[0];

  const summary = [
    `Brand: ${profile.brand_name}`,
    `AI Visibility Score: ${score}/100 (${grade})`,
    `Mentioned in ${mentioned} of ${total} AI prompts`,
    topComp
      ? `Top competitor in AI responses: ${topComp.name} (${topComp.mention_count} mentions)`
      : null,
    score < 50
      ? "Verdict: Low visibility — AI models rarely recommend this brand unprompted."
      : score < 70
      ? "Verdict: Moderate visibility — appears in some queries but significant gaps remain."
      : "Verdict: Strong visibility — brand appears consistently across AI models.",
  ].filter(Boolean).join("\n");

  return { score, grade, mentioned, total, brand: profile.brand_name, summary };
}

function handleGetPrompts(audit: AuditRow, filter: string) {
  const results = audit.results.prompt_results;
  const filtered = results.filter((r) =>
    filter === "mentioned" ? r.mentioned :
    filter === "not_mentioned" ? !r.mentioned :
    true
  );

  return {
    brand: audit.profile.brand_name,
    total: filtered.length,
    mentioned: filtered.filter((r) => r.mentioned).length,
    prompts: filtered.map((r, i) => ({
      index: i + 1,
      prompt: r.prompt,
      mentioned: r.mentioned,
      position: r.position ?? null,
      competitors_in_response: r.competitors_mentioned.map((c) => c.name),
    })),
  };
}

function handleGetCompetitors(audit: AuditRow) {
  return {
    brand: audit.profile.brand_name,
    competitors: audit.results.competitor_rankings.map((c) => ({
      name: c.name,
      mention_count: c.mention_count,
      avg_position: c.avg_position ?? null,
    })),
  };
}

// ── main handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // 1 — Auth
  const auth   = req.headers.get("authorization") ?? "";
  const apiKey = auth.startsWith("Bearer ") ? auth.slice(7).trim() : auth.trim();

  if (!apiKey) {
    return NextResponse.json(
      { jsonrpc: "2.0", id: null, error: { code: -32001, message: "Missing API key. Set Authorization: Bearer <key>" } },
      { status: 401 }
    );
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: keyRow } = await supabase
    .from("mcp_keys")
    .select("user_id")
    .eq("key", apiKey)
    .single();

  if (!keyRow) {
    return NextResponse.json(
      { jsonrpc: "2.0", id: null, error: { code: -32001, message: "Invalid API key." } },
      { status: 401 }
    );
  }

  // 2 — Parse request
  let body: { jsonrpc: string; id: unknown; method: string; params?: Record<string, unknown> };
  try {
    body = await req.json();
  } catch {
    return err(null, -32700, "Parse error");
  }

  const { id, method, params = {} } = body;

  // 3 — Route methods
  if (method === "initialize") {
    return ok(id, {
      protocolVersion: "2024-11-05",
      capabilities: { tools: {} },
      serverInfo: { name: "comly", version: "1.0.0" },
    });
  }

  if (method === "notifications/initialized") {
    return new NextResponse(null, { status: 204 });
  }

  if (method === "tools/list") {
    return ok(id, { tools: TOOLS });
  }

  if (method === "tools/call") {
    const toolName = params.name as string;
    const toolArgs = (params.arguments ?? {}) as Record<string, string>;

    // Load user's latest audit
    const { data: audit } = await supabase
      .from("audits")
      .select("brand_name, url, score, profile, results, threads_cache")
      .eq("user_id", keyRow.user_id)
      .single();

    if (!audit) {
      return ok(id, {
        content: [{ type: "text", text: "No audit found. Run an audit at trycomly.com first." }],
        isError: true,
      });
    }

    let result: unknown;

    if (toolName === "find_threads") {
      const platform = toolArgs.platform ?? "all";
      const cache    = (audit as AuditRow).threads_cache;
      const fromCache = isFresh(cache?.cached_at);

      let reddit: Thread[] = [];
      let quora:  Thread[] = [];

      if (fromCache) {
        reddit = cache?.reddit ?? [];
        quora  = cache?.quora  ?? [];
      } else {
        const host    = req.headers.get("host") ?? "trycomly.com";
        const proto   = host.startsWith("localhost") ? "http" : "https";
        const baseUrl = `${proto}://${host}`;
        const live = await fetchThreadsLive(
          (audit as AuditRow).profile,
          baseUrl,
          keyRow.user_id,
          supabase
        );
        reddit = live.reddit;
        quora  = live.quora;
      }

      result = handleFindThreads(reddit, quora, platform, fromCache);
    } else if (toolName === "get_visibility_score") {
      result = handleGetScore(audit as AuditRow);
    } else if (toolName === "get_prompt_results") {
      result = handleGetPrompts(audit as AuditRow, toolArgs.filter ?? "all");
    } else if (toolName === "get_competitor_rankings") {
      result = handleGetCompetitors(audit as AuditRow);
    } else {
      return err(id, -32601, `Unknown tool: ${toolName}`);
    }

    return ok(id, {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    });
  }

  return err(id, -32601, `Method not found: ${method}`);
}

// Some MCP clients probe with GET
export async function GET() {
  return NextResponse.json({
    name: "Comly MCP",
    version: "1.0.0",
    description: "AI visibility data for your brand — scores, prompt results, competitor rankings.",
  });
}
