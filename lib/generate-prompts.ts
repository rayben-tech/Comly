import { BrandProfile } from "@/types";

export function generateAuditPrompts(profile: BrandProfile): string[] {
  const { brand_name, category, target_users, main_use_cases, competitors } = profile;

  const useCase0 = main_use_cases[0] || category;
  const useCase1 = main_use_cases[1] || useCase0;
  const comp0 = competitors[0] || "similar tools";
  const allComps = competitors.slice(0, 3).filter(Boolean);
  const vsString = [brand_name, ...allComps].join(" vs ");

  return [
    // DIRECT (2)
    `What is ${brand_name} and what does it do?`,
    `Tell me about ${brand_name} — who is it for and what problem does it solve?`,

    // DISCOVERY (3)
    `What are the best ${category} tools for ${target_users}?`,
    `I need help with ${useCase0}. What tools do you recommend?`,
    `I'm a ${target_users} struggling with ${useCase0}. What software should I use?`,

    // COMPETITOR (3)
    `What are the best alternatives to ${comp0}?`,
    `${vsString} — which is best for ${target_users} and what are the key differences?`,
    `Who are the main competitors to ${brand_name} in the ${category} space? List tools that ${target_users} commonly compare when evaluating ${category} solutions.`,

    // PROBLEM BASED (1)
    `I want to ${useCase1} without spending too much time on it. What tool do you recommend and why?`,

    // OPEN ENDED (2)
    `What ${category} tools would you recommend for ${target_users}? Include well known and lesser known options.`,
    `What are the most popular ${category} platforms among ${target_users} right now and why do people choose them?`,
  ];
}
