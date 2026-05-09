import { BrandProfile } from "@/types";

// Which indices go to each model (must match PROMPT_MODELS in lib/prompt-models.ts)
export const OPENAI_INDICES = [0, 2, 3, 5, 6, 8, 9, 11, 12, 14, 15, 17, 18, 20, 21];
export const GEMINI_INDICES  = [1, 4, 7, 10, 13, 16, 19, 22, 23, 24];

export function generateAuditPrompts(profile: BrandProfile): string[] {
  const { brand_name, category, target_users, main_use_cases, competitors } = profile;

  const useCases = main_use_cases ?? [];
  const comps = competitors ?? [];
  const useCase0 = useCases[0] || category;
  const useCase1 = useCases[1] || useCase0;
  const comp0 = comps[0] || "similar tools";
  const allComps = comps.slice(0, 3).filter(Boolean);
  const vsString = [brand_name, ...allComps].join(" vs ");

  // Interleaved order: C=ChatGPT, G=Gemini
  // C G C C G C C G C C G C C G C C G C C G C C G G G
  return [
    /* 00 C Direct Brand   */ `What is ${brand_name} and what does it do?`,
    /* 01 G Discovery      */ `What are the best ${category} tools for ${target_users}?`,
    /* 02 C Competitor     */ `What are the best alternatives to ${comp0}?`,
    /* 03 C Discovery      */ `I want to ${useCase1} without spending too much time on it. What tool do you recommend and why?`,
    /* 04 G Discovery      */ `I need help with ${useCase0}. What tools do you recommend?`,
    /* 05 C Direct Brand   */ `Tell me about ${brand_name} — who is it for and what problem does it solve?`,
    /* 06 C Discovery      */ `My team needs to ${useCase0} more efficiently. What software should we use?`,
    /* 07 G Open Ended     */ `What ${category} tools would you recommend for ${target_users}? Include well-known and lesser-known options.`,
    /* 08 C Competitor     */ `${vsString} — which is best for ${target_users} and what are the key differences?`,
    /* 09 C Discovery      */ `I'm a ${target_users} looking to improve ${useCase0}. What's the best tool for my situation?`,
    /* 10 G Discovery      */ `What ${category} software do most ${target_users} use today?`,
    /* 11 C Direct Brand   */ `Is ${brand_name} worth it? What do real users say about it?`,
    /* 12 C Competitor     */ `I'm evaluating ${brand_name} vs ${comp0} — what are the honest pros and cons of each?`,
    /* 13 G Discovery      */ `What are the top ${category} platforms trusted by ${target_users}?`,
    /* 14 C Discovery      */ `What's the fastest way for a ${target_users} to get started with ${useCase1}?`,
    /* 15 C Discovery      */ `What ${category} tool works best for ${target_users} who need to ${useCase0}?`,
    /* 16 G Open Ended     */ `What are the most popular ${category} platforms among ${target_users} right now and why do people choose them?`,
    /* 17 C Discovery      */ `We're ${target_users} looking for a ${category} solution. What do you recommend?`,
    /* 18 C Discovery      */ `What tools do ${target_users} commonly use to handle ${useCase0} as they grow?`,
    /* 19 G Discovery      */ `Which ${category} tools are gaining traction among ${target_users} right now?`,
    /* 20 C Discovery      */ `What ${category} tool would you recommend to ${target_users} who are just getting started?`,
    /* 21 C Discovery      */ `What's the best ${category} setup for ${target_users} who want to move fast and stay organised?`,
    /* 22 G Open Ended     */ `If you were a ${target_users} starting fresh today, what ${category} tool would you choose and why?`,
    /* 23 G Open Ended     */ `What's the honest truth about the best ${category} tools available — what do people love and what frustrates them?`,
    /* 24 G Discovery      */ `What's the go-to ${category} tool for ${target_users} at a fast-growing company?`,
  ];
}
