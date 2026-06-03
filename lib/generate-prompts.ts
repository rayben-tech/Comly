import { BrandProfile } from "@/types";

// Which indices go to each model (must match PROMPT_MODELS in lib/prompt-models.ts)
export const OPENAI_INDICES = [0, 2, 3, 5, 6, 7];
export const GEMINI_INDICES  = [1, 4, 8];

export function generateAuditPrompts(profile: BrandProfile): string[] {
  const { brand_name, category, target_users, main_use_cases, competitors } = profile;

  const useCases = main_use_cases ?? [];
  const comps = competitors ?? [];
  const useCase0 = useCases[0] || category;
  const useCase1 = useCases[1] || useCase0;
  const comp0 = comps[0] || "similar tools";

  return [
    /* 00 ChatGPT   Direct Brand  */ `What is ${brand_name} and what does it do?`,
    /* 01 Gemini    Discovery     */ `What are the best ${category} tools for ${target_users}?`,
    /* 02 Claude    Competitor    */ `What are the best alternatives to ${comp0}?`,
    /* 03 ChatGPT   Discovery     */ `I want to ${useCase1} without spending too much time on it. What tool do you recommend and why?`,
    /* 04 Gemini    Discovery     */ `I need help with ${useCase0}. What tools do you recommend?`,
    /* 05 Perplexity Direct Brand */ `Tell me about ${brand_name} — who is it for and what problem does it solve?`,
    /* 06 ChatGPT   Competitor    */ `I'm evaluating ${brand_name} vs ${comp0} — what are the honest pros and cons of each?`,
    /* 07 Claude    Discovery     */ `What are the top ${category} platforms trusted by ${target_users}?`,
    /* 08 Gemini    Direct Brand  */ `Is ${brand_name} worth it? What do real users say about it?`,
  ];
}
