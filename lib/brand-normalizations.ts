// Corrects outdated names and known bad domains returned by AI models
const NORMALIZATIONS: Record<string, { name: string; domain: string }> = {
  "bard": { name: "Gemini", domain: "gemini.google.com" },
  "google bard": { name: "Gemini", domain: "gemini.google.com" },
  "gemini": { name: "Gemini", domain: "gemini.google.com" },
  "google gemini": { name: "Gemini", domain: "gemini.google.com" },
  "bing chat": { name: "Microsoft Copilot", domain: "copilot.microsoft.com" },
  "bing ai": { name: "Microsoft Copilot", domain: "copilot.microsoft.com" },
  "microsoft bing": { name: "Microsoft Copilot", domain: "copilot.microsoft.com" },
  "copilot": { name: "Microsoft Copilot", domain: "copilot.microsoft.com" },
  "microsoft copilot": { name: "Microsoft Copilot", domain: "copilot.microsoft.com" },
  "chatgpt": { name: "ChatGPT", domain: "chatgpt.com" },
  "claude": { name: "Claude", domain: "claude.ai" },
  "claude ai": { name: "Claude", domain: "claude.ai" },
  "perplexity": { name: "Perplexity", domain: "perplexity.ai" },
  "perplexity ai": { name: "Perplexity", domain: "perplexity.ai" },
  "deepseek": { name: "DeepSeek", domain: "deepseek.com" },
  "grok": { name: "Grok", domain: "x.ai" },
  "grok ai": { name: "Grok", domain: "x.ai" },
  "meta ai": { name: "Meta AI", domain: "meta.ai" },
  "llama": { name: "Meta AI", domain: "meta.ai" },
  "mistral": { name: "Mistral", domain: "mistral.ai" },
  "mistral ai": { name: "Mistral", domain: "mistral.ai" },
  "youchat": { name: "YouChat", domain: "you.com" },
  "you chat": { name: "YouChat", domain: "you.com" },
  "you.com": { name: "YouChat", domain: "you.com" },
  "replika": { name: "Replika", domain: "replika.com" },
  "jasper": { name: "Jasper", domain: "jasper.ai" },
  "jasper ai": { name: "Jasper", domain: "jasper.ai" },
  "openai": { name: "OpenAI", domain: "openai.com" },
  "notion ai": { name: "Notion AI", domain: "notion.so" },
  "copilot365": { name: "Microsoft Copilot", domain: "copilot.microsoft.com" },
};

export function normalizeBrand(name: string, domain: string): { name: string; domain: string } {
  const key = name.toLowerCase().trim();
  const norm = NORMALIZATIONS[key];
  if (norm) return norm;
  return { name, domain };
}
