import { PromptResult, CompetitorRanking } from "@/types";

export function calculateScore(results: PromptResult[]): number {
  const mentions = results.filter((r) => r.mentioned).length;
  if (mentions === 0) return 1;
  return Math.round((mentions / results.length) * 100);
}

export function calculateCompetitorRankings(
  results: PromptResult[],
  brandName: string
): CompetitorRanking[] {
  const map = new Map<string, { name: string; domain: string; mentions: number; positions: number[] }>();

  results.forEach((result) => {
    const seen = new Set<string>();
    result.competitors_mentioned.forEach((c) => {
      const { name, domain } = c;
      const key = name.toLowerCase().trim();
      if (!key || key === brandName.toLowerCase().trim() || seen.has(key)) return;
      seen.add(key);
      const entry = map.get(key) ?? { name, domain, mentions: 0, positions: [] };
      entry.mentions++;
      if (!entry.domain && domain) entry.domain = domain;
      if (c.position != null) entry.positions.push(c.position);
      map.set(key, entry);
    });
  });

  return Array.from(map.values())
    .map(({ name, domain, mentions, positions }) => ({
      name,
      domain,
      mentions,
      avg_position: positions.length > 0
        ? Math.round((positions.reduce((s, p) => s + p, 0) / positions.length) * 10) / 10
        : null,
    }))
    .sort((a, b) => b.mentions - a.mentions);
}
