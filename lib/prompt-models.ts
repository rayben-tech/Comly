// UI labels for each prompt index — does NOT affect which API is called.
// Real API routing lives in generate-prompts.ts (OPENAI_INDICES / GEMINI_INDICES).
// Distribution: ChatGPT ×8, Gemini ×7, Claude ×6, Perplexity ×4
export const PROMPT_MODELS = [
  { name: "ChatGPT",    domain: "chatgpt.com"        }, // 00 Direct Brand
  { name: "Gemini",     domain: "gemini.google.com"  }, // 01 Discovery
  { name: "Claude",     domain: "claude.ai"          }, // 02 Competitor
  { name: "ChatGPT",    domain: "chatgpt.com"        }, // 03 Discovery
  { name: "Gemini",     domain: "gemini.google.com"  }, // 04 Discovery
  { name: "Claude",     domain: "claude.ai"          }, // 05 Direct Brand
  { name: "ChatGPT",    domain: "chatgpt.com"        }, // 06 Discovery
  { name: "Gemini",     domain: "gemini.google.com"  }, // 07 Open Ended
  { name: "Perplexity", domain: "perplexity.ai"      }, // 08 Competitor
  { name: "ChatGPT",    domain: "chatgpt.com"        }, // 09 Discovery
  { name: "Gemini",     domain: "gemini.google.com"  }, // 10 Discovery
  { name: "ChatGPT",    domain: "chatgpt.com"        }, // 11 Direct Brand
  { name: "Claude",     domain: "claude.ai"          }, // 12 Competitor
  { name: "Gemini",     domain: "gemini.google.com"  }, // 13 Discovery
  { name: "Perplexity", domain: "perplexity.ai"      }, // 14 Discovery
  { name: "ChatGPT",    domain: "chatgpt.com"        }, // 15 Discovery
  { name: "Perplexity", domain: "perplexity.ai"      }, // 16 Open Ended
  { name: "Claude",     domain: "claude.ai"          }, // 17 Discovery
  { name: "ChatGPT",    domain: "chatgpt.com"        }, // 18 Discovery
  { name: "Gemini",     domain: "gemini.google.com"  }, // 19 Discovery
  { name: "Claude",     domain: "claude.ai"          }, // 20 Discovery
  { name: "ChatGPT",    domain: "chatgpt.com"        }, // 21 Discovery
  { name: "Gemini",     domain: "gemini.google.com"  }, // 22 Open Ended
  { name: "Claude",     domain: "claude.ai"          }, // 23 Open Ended
  { name: "Perplexity", domain: "perplexity.ai"      }, // 24 Discovery
];
