import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, X, Minus, ArrowLeft } from "lucide-react";

// ─── TYPES ─────────────────────────────────────────────────────────────────────

type FeatureValue = "yes" | "no" | "partial" | string;

interface CompetitorData {
  slug: string;
  name: string;
  domain: string;
  publishDate: string;
  headline: string;
  subheadline: string;
  intro: string;
  pricing: {
    comlyPrice: string;
    competitorPrice: string;
  };
  featureGroups: Array<{
    category: string;
    intro: string;
    items: Array<{
      feature: string;
      comly: FeatureValue;
      competitor: FeatureValue;
    }>;
  }>;
  verdict: {
    chooseComly: string[];
    chooseCompetitor: string[];
  };
  deepDives: Array<{
    title: string;
    body: string;
  }>;
}

// ─── DATA ──────────────────────────────────────────────────────────────────────

const COMPETITORS: Record<string, CompetitorData> = {
  "comly-vs-profound": {
    slug: "comly-vs-profound",
    name: "Profound",
    domain: "profound.ai",
    publishDate: "2025-01-15",
    headline: "Comly vs Profound: AI Visibility Tracking & Pricing Compared",
    subheadline:
      "Profound charges enterprise pricing for core AI tracking that Comly does at $49/mo — plus Comly includes 5 content generation tools that actively improve your score.",
    intro:
      "Comly and Profound both track your brand's visibility in AI-generated answers across major language models. The core difference comes down to who they're built for: Profound targets enterprise teams with custom pricing, demo-gated access, and white-glove onboarding. Comly is built for founders and marketing teams who want results in 5 minutes, not 5 weeks. This comparison covers every meaningful feature difference — and helps you decide which one fits your situation.",
    pricing: { comlyPrice: "$49/mo", competitorPrice: "$500+/mo" },
    featureGroups: [
      {
        category: "AI Visibility Tracking",
        intro:
          "The core question: which AI models do they track, how often, and how many prompts? This is where the two products diverge most clearly.",
        items: [
          { feature: "ChatGPT (GPT-4o) tracking", comly: "yes", competitor: "yes" },
          { feature: "Claude tracking", comly: "yes", competitor: "no" },
          { feature: "Perplexity tracking", comly: "yes", competitor: "partial" },
          { feature: "Gemini tracking", comly: "yes", competitor: "no" },
          { feature: "AI visibility score", comly: "yes", competitor: "yes" },
          { feature: "Score history & trends", comly: "yes", competitor: "yes" },
          { feature: "Competitor share-of-voice", comly: "yes", competitor: "yes" },
          { feature: "Daily prompt tracking", comly: "25 prompts/day", competitor: "Custom volume" },
        ],
      },
      {
        category: "Content & Growth Tools",
        intro:
          "Tracking tells you where you stand. Content tools let you act on it. This is the biggest gap between the two products.",
        items: [
          { feature: "llms.txt generator (auto-updated weekly)", comly: "yes", competitor: "no" },
          { feature: "Comparison page generator", comly: "yes", competitor: "no" },
          { feature: "Listicle generator (G2, Capterra, Product Hunt)", comly: "yes", competitor: "no" },
          { feature: "Hero rewrite suggestions", comly: "yes", competitor: "no" },
          { feature: "Reddit engagement threads", comly: "yes", competitor: "no" },
        ],
      },
      {
        category: "Alerts & Exports",
        intro:
          "How each tool notifies you when your score changes and how you get your data out.",
        items: [
          { feature: "Email alerts on score changes", comly: "yes", competitor: "yes" },
          { feature: "CSV export", comly: "yes", competitor: "yes" },
          { feature: "Slack notifications", comly: "no", competitor: "yes" },
          { feature: "API access", comly: "no", competitor: "yes" },
        ],
      },
      {
        category: "Setup & Support",
        intro:
          "How quickly you can go from signing up to seeing your first AI visibility data.",
        items: [
          { feature: "Self-serve signup (no demo call)", comly: "yes", competitor: "no" },
          { feature: "Time to first insight", comly: "5 minutes", competitor: "1–2 weeks" },
          { feature: "Priority support", comly: "yes", competitor: "yes" },
          { feature: "Dedicated account manager", comly: "no", competitor: "yes" },
        ],
      },
    ],
    verdict: {
      chooseComly: [
        "You're a founder, marketer, or small team and don't need enterprise contracts",
        "You want to track all 4 AI models — not just ChatGPT",
        "You need content tools to actually improve your AI ranking, not just observe it",
        "You want to get started in 5 minutes without a sales call",
      ],
      chooseCompetitor: [
        "Your brand is a Fortune 500 with complex enterprise SLA requirements",
        "You need dedicated account management and white-glove onboarding",
        "You need Slack and API integrations for a large internal data team",
      ],
    },
    deepDives: [
      {
        title: "Profound only tracks 2 models. Comly tracks 4.",
        body: "Profound's coverage is primarily ChatGPT and some Bing/Copilot. Comly tracks ChatGPT, Claude, Perplexity, and Gemini — because your customers are searching across all of them. If you're only measuring ChatGPT, you're missing the citations happening in Claude and Gemini every day. That's a real blind spot, and it compounds as those models grow.",
      },
      {
        title: "Comly ships the tools to improve your score. Profound doesn't.",
        body: "Profound is a monitoring platform. It tells you where you rank. Comly tells you where you rank and then opens a toolkit: generate your llms.txt so AI crawlers understand your brand, create comparison pages to capture 'X vs Y' queries, draft Reddit threads to build community presence, and rewrite your hero copy for AI discoverability. A score without action is just a report.",
      },
      {
        title: "No demo call. No waiting.",
        body: "Profound requires scheduling a demo before you can access the product — a common enterprise gatekeeping pattern. Comly is fully self-serve: paste your URL, get your AI visibility score in under 5 minutes. If you're a founder or marketer who wants to move fast, the 1-2 week onboarding cycle at Profound is a meaningful cost before you've seen a single result.",
      },
    ],
  },

  "comly-vs-otterly": {
    slug: "comly-vs-otterly",
    name: "Otterly.ai",
    domain: "otterly.ai",
    publishDate: "2025-01-20",
    headline: "Comly vs Otterly.ai: AI Mention Tracking & Features Compared",
    subheadline:
      "Otterly tracks AI mentions. Comly tracks AI mentions and ships the tools to generate more of them — llms.txt, comparison pages, listicles, and Reddit engagement built in.",
    intro:
      "Otterly.ai and Comly both monitor how often your brand gets mentioned in AI-generated responses. Where they diverge is in what happens after you have that data. Otterly is a monitoring tool: it shows you your score and tracks changes over time. Comly is monitoring plus a content toolkit — it gives you the llms.txt generator, comparison pages, listicle templates, and Reddit engagement tools to actively grow your score. This comparison covers the exact feature differences between both.",
    pricing: { comlyPrice: "$49/mo", competitorPrice: "$29–$199/mo" },
    featureGroups: [
      {
        category: "AI Visibility Tracking",
        intro:
          "Which models are tracked, how frequently, and how many prompts per period. Frequency matters — monthly snapshots miss most of the movement.",
        items: [
          { feature: "ChatGPT (GPT-4o) tracking", comly: "yes", competitor: "yes" },
          { feature: "Claude tracking", comly: "yes", competitor: "partial" },
          { feature: "Perplexity tracking", comly: "yes", competitor: "yes" },
          { feature: "Gemini tracking", comly: "yes", competitor: "no" },
          { feature: "AI visibility score", comly: "yes", competitor: "yes" },
          { feature: "Score history & trends", comly: "yes", competitor: "yes" },
          { feature: "Competitor tracking", comly: "Up to 5", competitor: "Up to 3" },
          { feature: "Prompt tracking frequency", comly: "25/day", competitor: "10–25/month" },
        ],
      },
      {
        category: "Content & Growth Tools",
        intro:
          "This is the main functional difference between the two products. Otterly is a monitoring tool. Comly is monitoring plus a full content generation suite.",
        items: [
          { feature: "llms.txt generator (auto-updated weekly)", comly: "yes", competitor: "no" },
          { feature: "Comparison page generator", comly: "yes", competitor: "no" },
          { feature: "Listicle generator (G2, Capterra, Product Hunt)", comly: "yes", competitor: "no" },
          { feature: "Hero rewrite suggestions", comly: "yes", competitor: "no" },
          { feature: "Reddit engagement threads", comly: "yes", competitor: "no" },
        ],
      },
      {
        category: "Alerts & Exports",
        intro: "Notification options and data portability.",
        items: [
          { feature: "Email alerts on score changes", comly: "yes", competitor: "yes" },
          { feature: "CSV export", comly: "yes", competitor: "Paid tiers only" },
          { feature: "Slack notifications", comly: "no", competitor: "yes" },
        ],
      },
      {
        category: "Setup & Support",
        intro: "Time to first data and support availability.",
        items: [
          { feature: "Self-serve setup", comly: "yes", competitor: "yes" },
          { feature: "Time to first insight", comly: "5 minutes", competitor: "10–15 minutes" },
          { feature: "Priority support", comly: "yes", competitor: "Paid tiers only" },
        ],
      },
    ],
    verdict: {
      chooseComly: [
        "You want to track all 4 AI models including Gemini",
        "You need content tools to actively grow your AI ranking — not just observe it",
        "You run 25+ prompts daily, not a monthly snapshot",
        "You want a single platform that monitors and improves AI visibility",
      ],
      chooseCompetitor: [
        "You only need basic mention tracking for 2–3 models",
        "You have a very tight budget and monitoring alone is enough for now",
        "You primarily need Slack integration to alert a larger team",
      ],
    },
    deepDives: [
      {
        title: "Daily tracking vs a monthly snapshot",
        body: "Otterly's lower tiers track 10–25 prompts per month. Comly tracks 25 prompts every single day — that's roughly 750+ prompts per month. AI rankings shift constantly as models retrain and new content gets indexed. Monthly data gives you a rough quarterly average. Daily data lets you see the week your score dropped, correlate it with a product launch or a competitor move, and respond. The difference in resolution matters.",
      },
      {
        title: "Monitoring alone isn't a strategy",
        body: "Otterly tells you when your score changes. Comly tells you when it changes and then gives you the tools to fix it. The llms.txt generator ensures AI crawlers have structured information about your brand. The comparison page generator creates content that captures '[your brand] vs [competitor]' queries. The Reddit thread generator helps you build community presence in the places AI models pull citations from. Monitoring without action is just a scoreboard.",
      },
      {
        title: "Full Gemini coverage",
        body: "Otterly has limited Gemini support. Comly tracks all four models at full parity — ChatGPT, Claude, Perplexity, and Gemini. As Gemini grows through deep Google integration, ignoring it means missing an increasing share of AI-assisted searches. The gap is small today and compounds quickly.",
      },
    ],
  },

  "comly-vs-peec-ai": {
    slug: "comly-vs-peec-ai",
    name: "Peec AI",
    domain: "peec.ai",
    publishDate: "2025-01-25",
    headline: "Comly vs Peec AI: AI Visibility Features & Pricing Compared",
    subheadline:
      "Peec AI measures your share of voice in AI search. Comly measures it and gives you the content tools to grow it — llms.txt, comparison pages, listicles, and Reddit threads built in.",
    intro:
      "Peec AI and Comly both track how often your brand appears in AI-generated search results across major language models. The key difference: Peec is a measurement platform — it tells you your share of voice, tracks changes, and lets you compare against competitors. Comly does the same measurement and then adds a full content generation toolkit designed to help you grow that share of voice. This comparison covers exactly what's in each product and who each one is built for.",
    pricing: { comlyPrice: "$49/mo", competitorPrice: "$49–$299/mo" },
    featureGroups: [
      {
        category: "AI Visibility Tracking",
        intro:
          "The fundamental tracking capabilities — which models, how often, and how many prompts are being monitored.",
        items: [
          { feature: "ChatGPT (GPT-4o) tracking", comly: "yes", competitor: "yes" },
          { feature: "Claude tracking", comly: "yes", competitor: "partial" },
          { feature: "Perplexity tracking", comly: "yes", competitor: "yes" },
          { feature: "Gemini tracking", comly: "yes", competitor: "no" },
          { feature: "AI visibility score", comly: "yes", competitor: "yes" },
          { feature: "Score history & trends", comly: "yes", competitor: "yes" },
          { feature: "Competitor share-of-voice", comly: "yes", competitor: "yes" },
          { feature: "Daily prompt tracking", comly: "25 prompts/day", competitor: "Variable by plan" },
        ],
      },
      {
        category: "Content & Growth Tools",
        intro:
          "This is where the two products diverge most clearly. Peec AI is a measurement platform. Comly adds a full content generation suite for improving what you measure.",
        items: [
          { feature: "llms.txt generator (auto-updated weekly)", comly: "yes", competitor: "no" },
          { feature: "Comparison page generator", comly: "yes", competitor: "no" },
          { feature: "Listicle generator (G2, Capterra, Product Hunt)", comly: "yes", competitor: "no" },
          { feature: "Hero rewrite for AI discoverability", comly: "yes", competitor: "no" },
          { feature: "Reddit engagement threads", comly: "yes", competitor: "no" },
        ],
      },
      {
        category: "Alerts & Exports",
        intro: "How each product alerts you to changes and lets you export your data.",
        items: [
          { feature: "Email alerts on score changes", comly: "yes", competitor: "yes" },
          { feature: "CSV export", comly: "yes", competitor: "yes" },
          { feature: "Slack notifications", comly: "no", competitor: "partial" },
        ],
      },
      {
        category: "Setup & Support",
        intro: "Getting started and getting help.",
        items: [
          { feature: "Self-serve setup", comly: "yes", competitor: "yes" },
          { feature: "Time to first insight", comly: "5 minutes", competitor: "~10 minutes" },
          { feature: "Priority support", comly: "yes", competitor: "Higher tiers only" },
        ],
      },
    ],
    verdict: {
      chooseComly: [
        "You want to track all 4 major AI models including Gemini",
        "You need content tools to act on your data, not just read a dashboard",
        "You want llms.txt auto-generated and updated every week",
        "You're a founder who needs both monitoring and a growth toolkit in one product",
      ],
      chooseCompetitor: [
        "Your primary need is share-of-voice analytics only — no content tools needed",
        "You need advanced API access for custom data pipelines",
        "You're focused primarily on Perplexity and ChatGPT only",
      ],
    },
    deepDives: [
      {
        title: "The llms.txt gap",
        body: "Peec AI has no llms.txt support. Comly generates your llms.txt file automatically and refreshes it every week. The llms.txt standard is the emerging convention that tells AI crawlers exactly what your brand does, who it's for, and where the authoritative information lives. Without it, you're leaving your AI ranking up to model inference. With it, you're giving models structured signal about your product. Peec doesn't have this. Comly does.",
      },
      {
        title: "Measure it, then move it",
        body: "Peec shows you your share of voice score. Comly shows you the same score — then opens a toolkit: generate a comparison page to rank for '[your brand] vs [competitor]' search queries, draft a Reddit thread that builds citation presence in your niche, rewrite your hero copy so AI models have cleaner signal about what you do. Measurement without action is just anxiety with better graphs.",
      },
      {
        title: "All 4 models, equal coverage",
        body: "Peec has strong ChatGPT and Perplexity coverage but weaker Gemini and Claude support. Comly tracks all four at full parity. The AI search landscape is actively fragmenting — different users default to different models, and your overall AI visibility score should reflect all of them equally, not just the two most established ones.",
      },
    ],
  },

  "comly-vs-semrush": {
    slug: "comly-vs-semrush",
    name: "Semrush",
    domain: "semrush.com",
    publishDate: "2025-02-01",
    headline: "Comly vs Semrush: Google SEO vs AI Chatbot Visibility",
    subheadline:
      "Semrush tracks Google. Comly tracks ChatGPT, Claude, Perplexity, and Gemini. These are genuinely different problems — and most teams need to solve both.",
    intro:
      "This comparison has a simple answer at its core: Semrush tracks Google search rankings, including Google's AI Overviews. Comly tracks what ChatGPT, Claude, Perplexity, and Gemini say about your brand. These are different AI systems with different training data, different citation logic, and different audiences. If your customers are using AI chatbots to research products in your category — and most of them are — Semrush tells you nothing about what those customers are seeing. This comparison covers exactly what each tool does, where they don't overlap, and when you'd use both.",
    pricing: { comlyPrice: "$49/mo", competitorPrice: "$140–$500+/mo" },
    featureGroups: [
      {
        category: "AI Chatbot Visibility",
        intro:
          "Whether each tool can tell you what ChatGPT, Claude, Perplexity, and Gemini say about your brand. This is Comly's core purpose — and entirely outside Semrush's scope.",
        items: [
          { feature: "ChatGPT (GPT-4o) brand tracking", comly: "yes", competitor: "no" },
          { feature: "Claude brand tracking", comly: "yes", competitor: "no" },
          { feature: "Perplexity brand tracking", comly: "yes", competitor: "no" },
          { feature: "Gemini brand tracking", comly: "yes", competitor: "no" },
          { feature: "AI visibility score + history", comly: "yes", competitor: "no" },
          { feature: "Competitor AI share-of-voice", comly: "yes", competitor: "no" },
          { feature: "Google AI Overviews tracking", comly: "no", competitor: "yes" },
        ],
      },
      {
        category: "Traditional SEO (Google)",
        intro:
          "Google keyword rankings, backlinks, and technical audits — Semrush's core strengths, and features Comly doesn't offer.",
        items: [
          { feature: "Keyword research", comly: "no", competitor: "yes" },
          { feature: "Backlink analysis", comly: "no", competitor: "yes" },
          { feature: "Technical site audit", comly: "no", competitor: "yes" },
          { feature: "Google rank tracking", comly: "no", competitor: "yes" },
          { feature: "Content marketing tools (Google-focused)", comly: "no", competitor: "yes" },
        ],
      },
      {
        category: "AI Content & Growth Tools",
        intro:
          "Tools specifically designed for AI chatbot discoverability — llms.txt generation, AI-optimized content, and engagement in the places AI models pull citations from.",
        items: [
          { feature: "llms.txt generator (auto-updated)", comly: "yes", competitor: "no" },
          { feature: "AI-optimized comparison page generator", comly: "yes", competitor: "no" },
          { feature: "AI-optimized listicle generator", comly: "yes", competitor: "no" },
          { feature: "Hero rewrite for AI discoverability", comly: "yes", competitor: "no" },
          { feature: "Reddit AI engagement threads", comly: "yes", competitor: "no" },
        ],
      },
      {
        category: "Alerts & Exports",
        intro: "Notifications and data portability for each platform.",
        items: [
          { feature: "Email alerts on AI score changes", comly: "yes", competitor: "no" },
          { feature: "CSV export", comly: "yes", competitor: "yes" },
          { feature: "Google rank change alerts", comly: "no", competitor: "yes" },
          { feature: "API access", comly: "no", competitor: "yes" },
        ],
      },
    ],
    verdict: {
      chooseComly: [
        "Your brand isn't being mentioned in ChatGPT, Claude, or Perplexity answers",
        "Your audience is starting their research with AI chatbots instead of Google",
        "You want to know what AI models say about you versus your competitors",
        "You need content tools built specifically for AI chatbot discoverability",
      ],
      chooseCompetitor: [
        "Traditional Google search is your primary traffic source and you're running a full SEO program",
        "You need keyword research, backlink analysis, or technical SEO auditing",
        "You're tracking Google AI Overviews specifically (not ChatGPT/Claude/Perplexity)",
      ],
    },
    deepDives: [
      {
        title: "Semrush doesn't track ChatGPT, Claude, or Perplexity — at all",
        body: "This is the fundamental difference. Semrush tracks your position in Google — including Google's AI Overviews feature. But it has zero visibility into what ChatGPT says when someone asks 'best project management tools,' what Claude recommends in your product category, or how Perplexity cites your brand in a comparison query. Those are entirely separate AI systems with separate training data and separate citation patterns. Semrush was built for Google. It doesn't know the others exist.",
      },
      {
        title: "They're complementary, not competing",
        body: "Semrush is excellent at what it does. If you're running a Google SEO program — keyword research, backlinks, technical audits, rank tracking — Semrush is hard to replace. The right framing isn't 'Comly or Semrush.' It's 'Semrush for Google, Comly for AI chatbots.' As more buyers start their research in ChatGPT or Perplexity instead of Google, the AI visibility layer becomes the part that's missing from most existing marketing stacks.",
      },
      {
        title: "Purpose-built vs retrofitted",
        body: "Semrush is a Google SEO platform that has added AI Overview tracking as one feature among hundreds. Comly is purpose-built around how AI language models discover, cite, and rank brands. Every feature — from the visibility score to the llms.txt generator to the Reddit engagement tool — is designed specifically for AI chatbot discoverability. When AI chatbot visibility is the problem you're solving, a purpose-built tool gives you more leverage than a feature bolted onto a broader platform.",
      },
    ],
  },
};

export function generateStaticParams() {
  return Object.keys(COMPETITORS).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = COMPETITORS[slug];
  if (!data) return {};
  return {
    title: `Comly vs ${data.name}: Features & Pricing Compared (2025)`,
    description: data.subheadline,
    openGraph: {
      title: `Comly vs ${data.name} — AI Visibility Comparison`,
      description: data.subheadline,
    },
  };
}

// ─── HELPERS ───────────────────────────────────────────────────────────────────

function ComlyLogo({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={Math.round(size * 1.1)} viewBox="0 0 100 110" fill="none">
      <path
        d="M50 4 C54 4 57 6 59.5 10 L93 68 C97 74 97 80 93.5 85 C90 90 84 93 77 93 L23 93 C16 93 10 90 6.5 85 C3 80 3 74 7 68 L40.5 10 C43 6 46 4 50 4Z"
        fill="#1a1a2e"
      />
      <path
        d="M28 72 C32 62 44 56 58 60 C66 62.5 70 67 68 70 C66 73 60 72 52 69 C44 66 36 68 32 74 C30 77 28 75 28 72Z"
        fill="#7c3aed"
      />
    </svg>
  );
}

function Cell({ value }: { value: FeatureValue }) {
  if (value === "yes")
    return (
      <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-[#5B2D91]">
        <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
      </span>
    );
  if (value === "no")
    return (
      <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-[#f0f0f0]">
        <X className="w-3.5 h-3.5 text-[#cccccc]" strokeWidth={3} />
      </span>
    );
  if (value === "partial")
    return (
      <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-amber-100">
        <Minus className="w-3.5 h-3.5 text-amber-500" strokeWidth={3} />
      </span>
    );
  // Text value — render check + label
  const parts = value.split(" ");
  const hasCheck = parts.length > 1;
  return (
    <span className="inline-flex items-center gap-1.5 flex-wrap justify-center">
      <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-[#5B2D91]">
        <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
      </span>
      <span className="text-[11px] font-semibold text-[#aaaaaa]">{value.replace("yes ", "").trim()}</span>
    </span>
  );
}

// ─── PAGE ──────────────────────────────────────────────────────────────────────

export default async function ComparisonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = COMPETITORS[slug];
  if (!data) notFound();

  const otherComparisons = Object.values(COMPETITORS).filter((c) => c.slug !== data.slug);

  return (
    <div className="min-h-screen bg-white">

      {/* ── Nav ─────────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-[#f0f0f0]">
        <div className="max-w-2xl mx-auto px-5 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <ComlyLogo size={22} />
            <span className="font-extrabold text-[#0a0a0a] text-[15px]">Comly</span>
          </Link>
          <Link
            href="/auth"
            className="bg-[#5B2D91] text-white text-[13px] font-bold px-4 py-2 rounded-xl hover:bg-[#4a2478] transition-colors"
          >
            Try free →
          </Link>
        </div>
      </nav>

      {/* ── Article ─────────────────────────────────────────────────────── */}
      <article className="max-w-2xl mx-auto px-5 pt-10 pb-24">

        {/* Breadcrumb */}
        <Link
          href="/compare"
          className="inline-flex items-center gap-1.5 text-[13px] text-[#aaaaaa] hover:text-[#5B2D91] transition-colors mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          All comparisons
        </Link>

        {/* Meta */}
        <div className="flex items-center gap-2 text-[13px] text-[#aaaaaa] mb-5">
          <span>{data.publishDate}</span>
          <span>·</span>
          <span className="text-[#5B2D91] font-medium">comparison, {data.name.toLowerCase().replace(/\s/g, "-")}</span>
        </div>

        {/* Title */}
        <h1 className="text-[36px] sm:text-[42px] font-black text-[#0a0a0a] leading-[1.1] tracking-tight mb-4">
          {data.headline}
        </h1>

        {/* Subheadline */}
        <p className="text-[16px] text-[#6b6b6b] leading-relaxed mb-8">
          {data.subheadline}
        </p>

        {/* VS Hero */}
        <div className="rounded-2xl overflow-hidden flex border border-[#e8e8e8] mb-10" style={{ minHeight: 140 }}>
          {/* Comly side */}
          <div
            className="flex-1 flex flex-col items-center justify-center gap-2 py-8 px-6"
            style={{ background: "linear-gradient(135deg, #5B2D91 0%, #3b1270 100%)" }}
          >
            <ComlyLogo size={32} />
            <span className="text-white font-extrabold text-[16px]">Comly</span>
            <span className="text-white/50 text-[12px] font-medium">{data.pricing.comlyPrice}</span>
          </div>
          {/* VS divider */}
          <div className="w-14 bg-white flex items-center justify-center shrink-0 border-x border-[#e8e8e8]">
            <span className="text-[13px] font-black text-[#cccccc]">vs</span>
          </div>
          {/* Competitor side */}
          <div className="flex-1 flex flex-col items-center justify-center gap-2 py-8 px-6 bg-[#fafafa]">
            <img
              src={`https://www.google.com/s2/favicons?domain=${data.domain}&sz=64`}
              alt={data.name}
              width={32}
              height={32}
              className="rounded-lg"
            />
            <span className="text-[#0a0a0a] font-extrabold text-[16px]">{data.name}</span>
            <span className="text-[#aaaaaa] text-[12px] font-medium">{data.pricing.competitorPrice}</span>
          </div>
        </div>

        {/* Intro */}
        <p className="text-[15px] text-[#3a3a3a] leading-[1.8] mb-12">{data.intro}</p>

        {/* ── Feature Tables ─────────────────────────────────────────── */}
        {data.featureGroups.map((group, gi) => (
          <div key={gi} className="mb-12">
            <h2 className="text-[22px] font-extrabold text-[#0a0a0a] mb-2">{group.category}</h2>
            <p className="text-[14px] text-[#6b6b6b] leading-relaxed mb-5">{group.intro}</p>

            <div className="border border-[#e8e8e8] rounded-xl overflow-hidden">
              {/* Table header */}
              <div className="grid bg-[#fafafa] border-b border-[#e8e8e8]"
                style={{ gridTemplateColumns: "1fr 90px 90px" }}>
                <div className="px-5 py-3">
                  <span className="text-[11px] font-bold text-[#aaaaaa] uppercase tracking-wider">Feature</span>
                </div>
                <div className="px-3 py-3 text-center">
                  <span className="text-[11px] font-bold text-[#5B2D91] uppercase tracking-wider">Comly</span>
                </div>
                <div className="px-3 py-3 text-center">
                  <span className="text-[11px] font-bold text-[#aaaaaa] uppercase tracking-wider">{data.name}</span>
                </div>
              </div>

              {group.items.map((item, ii) => (
                <div
                  key={ii}
                  className={`grid hover:bg-[#fafafa] transition-colors ${ii < group.items.length - 1 ? "border-b border-[#f0f0f0]" : ""}`}
                  style={{ gridTemplateColumns: "1fr 90px 90px" }}
                >
                  <div className="px-5 py-3.5">
                    <span className="text-[13px] text-[#3a3a3a]">{item.feature}</span>
                  </div>
                  <div className="px-3 py-3.5 flex items-center justify-center">
                    <Cell value={item.comly} />
                  </div>
                  <div className="px-3 py-3.5 flex items-center justify-center">
                    <Cell value={item.competitor} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* ── Deep Dives ─────────────────────────────────────────────── */}
        <div className="mb-12">
          {data.deepDives.map((dive, i) => (
            <div key={i} className="mb-8">
              <h2 className="text-[20px] font-extrabold text-[#0a0a0a] mb-3">{dive.title}</h2>
              <p className="text-[14px] text-[#3a3a3a] leading-[1.8]">{dive.body}</p>
            </div>
          ))}
        </div>

        {/* ── Verdict ────────────────────────────────────────────────── */}
        <div className="mb-12">
          <h2 className="text-[22px] font-extrabold text-[#0a0a0a] mb-5">Who should use what</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="border border-[#5B2D91]/20 bg-[#5B2D91]/4 rounded-xl p-5">
              <p className="text-[12px] font-bold text-[#5B2D91] uppercase tracking-wider mb-4">
                Choose Comly if…
              </p>
              <ul className="space-y-2.5">
                {data.verdict.chooseComly.map((point, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#5B2D91] mt-2 shrink-0" />
                    <span className="text-[13px] text-[#3a3a3a] leading-relaxed">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="border border-[#e8e8e8] bg-[#fafafa] rounded-xl p-5">
              <p className="text-[12px] font-bold text-[#aaaaaa] uppercase tracking-wider mb-4">
                Choose {data.name} if…
              </p>
              <ul className="space-y-2.5">
                {data.verdict.chooseCompetitor.map((point, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#cccccc] mt-2 shrink-0" />
                    <span className="text-[13px] text-[#6b6b6b] leading-relaxed">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* ── CTA ────────────────────────────────────────────────────── */}
        <div
          className="rounded-2xl text-center py-12 px-8 mb-12 relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #5B2D91 0%, #3b1270 45%, #1a0a3d 100%)",
          }}
        >
          <div className="pointer-events-none absolute -top-12 -right-12 w-[240px] h-[240px] rounded-full opacity-20"
            style={{ background: "radial-gradient(circle, #a855f7, transparent 70%)" }} />
          <h2 className="text-[24px] font-extrabold text-white mb-2 relative">
            See your AI visibility score in 5 minutes
          </h2>
          <p className="text-[13px] text-white/50 mb-6 relative">
            Track your brand across ChatGPT, Claude, Perplexity, and Gemini.
          </p>
          <Link
            href="/auth"
            className="relative inline-flex items-center gap-2 bg-white text-[#5B2D91] font-extrabold text-[14px] px-6 py-3 rounded-xl hover:bg-white/90 transition-colors shadow-lg shadow-black/20"
          >
            Try Comly free →
          </Link>
          <p className="relative text-white/25 text-[11px] mt-3">$49/mo · Cancel anytime</p>
        </div>

        {/* ── More comparisons ───────────────────────────────────────── */}
        <div>
          <p className="text-[12px] font-bold text-[#aaaaaa] uppercase tracking-wider mb-4">
            More comparisons
          </p>
          <div className="flex flex-col gap-2">
            {otherComparisons.map((c) => (
              <Link
                key={c.slug}
                href={`/compare/${c.slug}`}
                className="flex items-center justify-between px-4 py-3 rounded-xl border border-[#e8e8e8] hover:border-[#5B2D91]/30 hover:bg-[#5B2D91]/3 transition-all group"
              >
                <span className="text-[13px] font-semibold text-[#3a3a3a] group-hover:text-[#5B2D91] transition-colors">
                  Comly vs {c.name}
                </span>
                <span className="text-[12px] text-[#aaaaaa] group-hover:text-[#5B2D91] transition-colors">→</span>
              </Link>
            ))}
          </div>
        </div>

      </article>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="border-t border-[#f0f0f0] py-7 px-5">
        <div className="max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            <ComlyLogo size={18} />
            <span className="font-extrabold text-[#0a0a0a] text-[13px]">Comly</span>
          </Link>
          <p className="text-[11px] text-[#aaaaaa]">© 2025 Comly. All rights reserved.</p>
          <div className="flex gap-5">
            <Link href="/privacy" className="text-[11px] text-[#aaaaaa] hover:text-[#0a0a0a] transition-colors">Privacy</Link>
            <Link href="/terms" className="text-[11px] text-[#aaaaaa] hover:text-[#0a0a0a] transition-colors">Terms</Link>
            <Link href="/compare" className="text-[11px] text-[#aaaaaa] hover:text-[#0a0a0a] transition-colors">Compare</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
