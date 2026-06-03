// UI labels for each prompt index — does NOT affect which API is called.
// Real API routing lives in generate-prompts.ts (OPENAI_INDICES / GEMINI_INDICES).
// Distribution: ChatGPT ×5, Gemini ×5, Claude ×3, Perplexity ×2
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
  { name: "ChatGPT",    domain: "chatgpt.com"        }, // 09 Discovery
  { name: "Gemini",     domain: "gemini.google.com"  }, // 10 Open Ended
  { name: "Perplexity", domain: "perplexity.ai"      }, // 11 Discovery
  { name: "Claude",     domain: "claude.ai"          }, // 12 Discovery
  { name: "ChatGPT",    domain: "chatgpt.com"        }, // 13 Discovery
  { name: "Gemini",     domain: "gemini.google.com"  }, // 14 Open Ended
];
