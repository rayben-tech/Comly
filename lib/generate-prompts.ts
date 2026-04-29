import { BrandProfile } from "@/types";

export function generateAuditPrompts(profile: BrandProfile): string[] {
  const { brand_name, category, target_users, main_use_cases, competitors } = profile;

  const useCase0 = main_use_cases[0] || category;
  const comp0 = competitors[0] || "similar tools";
  const allComps = competitors.slice(0, 3).filter(Boolean);
  const vsString = [brand_name, ...allComps].join(" vs ");

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
    `${vsString} — which is best for ${target_users} and what are the key differences?`,

    // DIRECT BRAND — honest check: does AI know you?
    `Is ${brand_name} a good tool for ${useCase0}?`,

    // COMPETITOR DISCOVERY — named competitors anchor the response
    `Who are the main direct competitors to ${brand_name} in the ${category} space? List the tools that ${target_users} most commonly compare when evaluating ${category} solutions, including ${allComps.join(", ")} and others.`,

    // OPEN ENDED — catches unexpected mentions
    `What ${category} tools would you recommend for ${target_users} in 2025? Include well known and lesser known options.`,
  ];
}
