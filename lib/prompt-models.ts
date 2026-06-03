// UI labels for each prompt index — does NOT affect which API is called.
// Real API routing lives in generate-prompts.ts (OPENAI_INDICES / GEMINI_INDICES).
// Distribution: ChatGPT ×3, Gemini ×3, Claude ×2, Perplexity ×1
export const PROMPT_MODELS = [
  { name: "ChatGPT",    domain: "chatgpt.com"        }, // 00 Direct Brand
  { name: "Gemini",     domain: "gemini.google.com"  }, // 01 Discovery
  { name: "Claude",     domain: "claude.ai"          }, // 02 Competitor
  { name: "ChatGPT",    domain: "chatgpt.com"        }, // 03 Discovery
  { name: "Gemini",     domain: "gemini.google.com"  }, // 04 Discovery
  { name: "Perplexity", domain: "perplexity.ai"      }, // 05 Direct Brand
  { name: "ChatGPT",    domain: "chatgpt.com"        }, // 06 Competitor
  { name: "Claude",     domain: "claude.ai"          }, // 07 Discovery
  { name: "Gemini",     domain: "gemini.google.com"  }, // 08 Direct Brand
];
