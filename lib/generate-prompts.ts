import { BrandProfile } from "@/types";

export function generateAuditPrompts(profile: BrandProfile): string[] {
  const { brand_name, category, target_users, main_use_cases, competitors } = profile;

  const useCase0 = main_use_cases[0] || category;
  const comp0 = competitors[0] || "similar tools";
  const comp1 = competitors[1] || competitors[0] || "other options";

  return [
    // DIRECT BRAND — definition query always first (highest-signal prompt)
    `What is ${brand_name} and what does it do?`,

    // DISCOVERY — pure, no brand mention
    `What are the best ${category} tools for ${target_users}?`,
    `What is the top ${category} software available right now?`,
    `I need help with ${useCase0}. What tools do you recommend?`,
    `What are the most popular ${category} platforms among ${target_users}?`,

    // COMPETITOR COMPARISON — realistic buyer behavior
    `What are the best alternatives to ${comp0}?`,
    `${comp0} vs ${comp1} — which is better and what other options should I consider?`,

    // DIRECT BRAND — honest check: does AI know you?
    `Is ${brand_name} a good tool for ${useCase0}?`,

    // COMPETITOR DISCOVERY — maximize competitor list
    `Give me the most comprehensive list possible of every ${category} tool and competitor to ${brand_name}. Include major players, niche alternatives, and emerging tools — aim for 20 options.`,

    // OPEN ENDED — catches unexpected mentions
    `What ${category} tools would you recommend for ${target_users} in 2025? Include well known and lesser known options.`,
  ];
}
