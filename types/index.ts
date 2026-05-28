export interface BrandProfile {
  brand_name: string;
  description: string;
  category: string;
  target_users: string;
  main_use_cases: string[];
  competitors: string[];
  differentiators: string;
  pricing_tiers: { plan: string; price: string }[];
  url: string;
  logo_url?: string;
}

export interface PromptResult {
  prompt: string;
  response_text: string;
  mentioned: boolean;
  position: number | null;
  competitors_mentioned: { name: string; domain: string; position: number | null }[];
  sources: { domain: string; title: string }[];
}

export interface CompetitorRanking {
  name: string;
  domain: string;
  mentions: number;
  avg_position: number | null;
}

export interface AuditResult {
  score: number;
  total_mentions: number;
  prompt_results: PromptResult[];
  competitor_rankings: CompetitorRanking[];
}

export type AuditStep = "input" | "scraping" | "profile" | "review-prompts" | "auditing" | "results" | "paywall" | "confirming-payment" | "fake-results";

export interface MentionResult {
  url: string;
  title: string;
  description: string;
  domain: string;
  category: "reddit" | "review" | "press" | "other";
}

export interface CompetitorMentions {
  name: string;
  domain: string;
  mentions: number;
  results: MentionResult[];
}
