"use client";

import { useState, useEffect } from "react";
import { Users, Bot, Copy, Check, ChevronDown, ChevronUp } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { BrandProfile } from "@/types";

interface VisitRow { source: string; count: number; }
interface VisitsData { visitors: VisitRow[]; bots: VisitRow[]; total: number; }

const LLM_COLORS: Record<string, string> = {
  ChatGPT:    "#10a37f",
  Perplexity: "#20b2aa",
  Claude:     "#d97706",
  Gemini:     "#4285f4",
  Copilot:    "#0078d4",
};
const LLM_ICONS: Record<string, string> = {
  ChatGPT:    "https://www.google.com/s2/favicons?domain=chatgpt.com&sz=32",
  Perplexity: "https://www.google.com/s2/favicons?domain=perplexity.ai&sz=32",
  Claude:     "https://www.google.com/s2/favicons?domain=claude.ai&sz=32",
  Gemini:     "https://www.google.com/s2/favicons?domain=gemini.google.com&sz=32",
  Copilot:    "https://www.google.com/s2/favicons?domain=copilot.microsoft.com&sz=32",
};

const DEMO_VISITORS: VisitRow[] = [
  { source: "ChatGPT",    count: 47 },
  { source: "Perplexity", count: 23 },
  { source: "Gemini",     count: 12 },
  { source: "Claude",     count:  8 },
  { source: "Copilot",    count:  5 },
];
const DEMO_BOTS: VisitRow[] = [
  { source: "ChatGPT",    count: 214 },
  { source: "Claude",     count: 187 },
  { source: "Perplexity", count:  93 },
  { source: "Gemini",     count:  61 },
];

function getScript(token: string, origin: string) {
  return `<script>
(function(){
  var T='${token}';
  var V={'chatgpt.com':'ChatGPT','chat.openai.com':'ChatGPT','perplexity.ai':'Perplexity','claude.ai':'Claude','gemini.google.com':'Gemini','copilot.microsoft.com':'Copilot','bing.com':'Copilot'};
  var B={'GPTBot':'ChatGPT','ClaudeBot':'Claude','PerplexityBot':'Perplexity','anthropic-ai':'Claude','Googlebot-Extended':'Gemini'};
  var ua=navigator.userAgent,ref=document.referrer,src=null,type='visitor';
  for(var b in B){if(ua.indexOf(b)!==-1){src=B[b];type='bot';break;}}
  if(!src){for(var d in V){if(ref.indexOf(d)!==-1){src=V[d];break;}}}
  if(!src)return;
  fetch('${origin}/api/track',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token:T,source:src,type:type,url:window.location.href}),keepalive:true}).catch(function(){});
})();
<\/script>`.trim();
}

function SourceBar({ row, max }: { row: VisitRow; max: number }) {
  const pct = Math.round((row.count / max) * 100);
  const color = LLM_COLORS[row.source] ?? "#5B2D91";
  return (
    <div className="flex items-center gap-3">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={LLM_ICONS[row.source] ?? ""} alt={row.source} width={18} height={18} className="w-[18px] h-[18px] rounded-sm shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[13px] font-semibold text-[#0a0a0a]">{row.source}</span>
          <span className="text-[13px] font-semibold text-[#6b6b6b]">{row.count.toLocaleString()}</span>
        </div>
        <div className="h-1.5 w-full bg-[#f0f0f0] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${pct}%`, backgroundColor: color }}
          />
        </div>
      </div>
    </div>
  );
}

interface Props {
  userId?: string;
  profile: BrandProfile;
}

export function VisitorsPage({ userId, profile }: Props) {
  const [token,       setToken]       = useState<string | null>(null);
  const [visits,      setVisits]      = useState<VisitsData | null>(null);
  const [loading,     setLoading]     = useState(true);
  const [copied,      setCopied]      = useState(false);
  const [scriptOpen,  setScriptOpen]  = useState(true);

  const isUnlocked = visits !== null && visits.total > 0;
  const origin = "https://www.trycomly.com";

  useEffect(() => {
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setLoading(false); return; }

        // Get or create tracking token directly via Supabase client (RLS uses session automatically)
        let { data: row } = await supabase
          .from("llm_tracking_tokens")
          .select("token")
          .eq("user_id", user.id)
          .single();

        if (!row) {
          const { data: created } = await supabase
            .from("llm_tracking_tokens")
            .insert({ user_id: user.id })
            .select("token")
            .single();
          row = created;
        }

        if (!row?.token) { setLoading(false); return; }
        setToken(row.token);

        // Fetch visits for this token
        const { data: visits } = await supabase
          .from("llm_visits")
          .select("source, type")
          .eq("token", row.token);

        if (visits?.length) {
          const visitorMap = new Map<string, number>();
          const botMap     = new Map<string, number>();
          for (const v of visits) {
            const map = v.type === "bot" ? botMap : visitorMap;
            map.set(v.source, (map.get(v.source) ?? 0) + 1);
          }
          const toArr = (m: Map<string, number>) =>
            Array.from(m.entries()).map(([source, count]) => ({ source, count })).sort((a, b) => b.count - a.count);
          setVisits({ visitors: toArr(visitorMap), bots: toArr(botMap), total: visits.length });
        } else {
          setVisits({ visitors: [], bots: [], total: 0 });
        }
      } catch (e) {
        console.error("visitors-page error:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function copyScript() {
    if (!token) return;
    navigator.clipboard.writeText(getScript(token, origin));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const visitorMax = Math.max(1, ...(isUnlocked ? visits.visitors : DEMO_VISITORS).map(v => v.count));
  const botMax     = Math.max(1, ...(isUnlocked ? visits.bots     : DEMO_BOTS    ).map(v => v.count));

  return (
    <div className="p-6 space-y-4">

      {/* Human visitors card */}
      <div className="bg-white border border-[#e8e8e8] rounded-2xl overflow-hidden">

        {/* Header */}
        <div className="px-8 pt-8 pb-6 border-b border-[#f0f0f0]">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#f3eeff] flex items-center justify-center shrink-0">
              <Users className="w-5 h-5 text-[#5B2D91]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2.5 mb-1.5">
                <h2 className="text-[18px] font-bold text-[#0a0a0a]">LLM Visitors</h2>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-100">Pro</span>
              </div>
              <p className="text-[14px] text-[#6b6b6b] leading-relaxed">
                Real people who clicked a link to {profile.brand_name} inside ChatGPT, Perplexity, Gemini, or Claude.
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="px-8 py-10 flex justify-center">
            <div className="w-6 h-6 border-2 border-[#5B2D91] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Stats — blurred until unlocked */}
            <div className={`px-8 py-6 space-y-4 relative ${!isUnlocked ? "select-none" : ""}`}>
              {!isUnlocked && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 backdrop-blur-[6px] bg-white/60 rounded-b-2xl">
                  <p className="text-[14px] font-bold text-[#0a0a0a]">Install the snippet to unlock</p>
                  <p className="text-[12px] text-[#6b6b6b] max-w-xs text-center leading-relaxed">
                    Paste the tracking script in your site&apos;s <code className="font-mono bg-[#f3eeff] px-1 rounded">&lt;head&gt;</code> and real visitor data will appear here.
                  </p>
                </div>
              )}
              <div className={!isUnlocked ? "blur-sm pointer-events-none" : ""}>
                {(isUnlocked ? visits.visitors : DEMO_VISITORS).map(row => (
                  <SourceBar key={row.source} row={row} max={visitorMax} />
                ))}
                {isUnlocked && visits.visitors.length === 0 && (
                  <p className="text-[13px] text-[#aaaaaa] text-center py-4">No LLM visitor traffic yet — check back soon.</p>
                )}
              </div>
            </div>

            {/* Script snippet — always visible */}
            <div className="border-t border-[#f0f0f0]">
              <button
                onClick={() => setScriptOpen(v => !v)}
                className="w-full flex items-center justify-between px-8 py-4 text-left hover:bg-[#fafafa] transition-colors"
              >
                <span className="text-[13px] font-semibold text-[#0a0a0a]">
                  {isUnlocked ? "Tracking script (installed)" : "📋 Install tracking script"}
                </span>
                <div className="flex items-center gap-2">
                  {isUnlocked && (
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">Active</span>
                  )}
                  {scriptOpen ? <ChevronUp className="w-4 h-4 text-[#aaaaaa]" /> : <ChevronDown className="w-4 h-4 text-[#aaaaaa]" />}
                  </div>
                </button>

                {scriptOpen && (
                  <div className="px-8 pb-6">
                    {!isUnlocked && (
                      <p className="text-[13px] text-[#6b6b6b] mb-4 leading-relaxed">
                        Paste this before the closing <code className="font-mono bg-[#f3eeff] text-[#5B2D91] px-1 rounded">&lt;/head&gt;</code> tag on every page of your site.
                      </p>
                    )}
                    {token ? (
                      <div className="relative rounded-xl overflow-hidden">
                        <pre className="bg-[#0a0a0a] text-[#a78bfa] text-[11px] leading-relaxed px-5 py-4 font-mono overflow-x-auto whitespace-pre-wrap break-all">
                          {getScript(token, origin)}
                        </pre>
                        <button
                          onClick={copyScript}
                          className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-semibold transition-colors"
                        >
                          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          {copied ? "Copied!" : "Copy"}
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center py-6">
                        <div className="w-5 h-5 border-2 border-[#5B2D91] border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                  </div>
                )}
              </div>
          </>
        )}
      </div>

      {/* Bot crawlers card */}
      <div className="bg-white border border-[#e8e8e8] rounded-2xl overflow-hidden">
        <div className="px-8 pt-6 pb-5 border-b border-[#f0f0f0]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#f0fdf4] flex items-center justify-center shrink-0">
              <Bot className="w-4.5 h-4.5 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-[#0a0a0a]">AI Crawlers</h3>
              <p className="text-[12px] text-[#6b6b6b] mt-0.5">LLM bots that indexed your site</p>
            </div>
          </div>
        </div>

        <div className={`px-8 py-5 space-y-4 relative ${!isUnlocked ? "select-none" : ""}`}>
          {!isUnlocked && (
            <div className="absolute inset-0 z-10 backdrop-blur-[6px] bg-white/60 rounded-b-2xl flex items-center justify-center">
              <p className="text-[13px] font-semibold text-[#6b6b6b]">Unlocks with the tracking script</p>
            </div>
          )}
          <div className={!isUnlocked ? "blur-sm pointer-events-none" : ""}>
            {(isUnlocked ? visits.bots : DEMO_BOTS).map(row => (
              <SourceBar key={row.source} row={row} max={botMax} />
            ))}
            {isUnlocked && visits.bots.length === 0 && (
              <p className="text-[13px] text-[#aaaaaa] text-center py-4">No bot crawls detected yet via script.</p>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
