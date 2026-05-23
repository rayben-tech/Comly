import { BrandProfile, PromptResult, CompetitorRanking, CompetitorMentions } from "@/types";

export const DEMO_PROFILE: BrandProfile = {
  brand_name: "Notion",
  description:
    "The all-in-one workspace for your notes, tasks, wikis, and databases. Teams use Notion to plan projects, share knowledge, and get work done.",
  category: "Productivity & Collaboration",
  target_users: "Teams, startups, and individuals",
  main_use_cases: ["Note-taking", "Project management", "Knowledge base", "Task tracking", "Wiki & documentation"],
  competitors: ["Trello", "Asana", "Monday.com", "ClickUp", "Confluence"],
  differentiators:
    "Flexible block-based editor, powerful relational databases, all-in-one workspace that replaces multiple tools, extensive template library, strong collaboration features.",
  pricing_tiers: [
    { plan: "Free",       price: "$0/month"          },
    { plan: "Plus",       price: "$8/user/month"      },
    { plan: "Business",   price: "$15/user/month"     },
    { plan: "Enterprise", price: "Custom"             },
  ],
  url: "https://notion.so",
};

// 25 prompts — interleaved ChatGPT / Gemini
// Pattern: C G C C G C C G C C G C C G C C G C C G C C G G G
// Types: Direct Brand×3, Competitor×3, Discovery×15, Open Ended×4
// Notion mentioned in 18/25 → score 72%
export const DEMO_PROMPT_RESULTS: PromptResult[] = [
  // 00 — ChatGPT — Direct Brand — ✓
  {
    prompt: "What is Notion and what does it do?",
    response_text:
      "Notion is an all-in-one workspace that combines notes, databases, kanban boards, wikis, calendars and reminders. Teams use it to organise their entire work life — from project tracking and sprint planning to company wikis and onboarding docs. It's especially popular with startups and remote teams for its block-based editor, powerful relational databases, and the ability to replace Confluence, Trello and Google Docs with a single connected workspace.",
    mentioned: true,
    position: 1,
    competitors_mentioned: [],
    sources: [
      { domain: "notion.so",      title: "Notion – The all-in-one workspace"       },
      { domain: "techcrunch.com", title: "Notion raises $275M at a $10B valuation" },
      { domain: "g2.com",         title: "Notion Reviews 2025 – G2"                },
    ],
  },

  // 01 — Gemini — Discovery — ✓
  {
    prompt: "What are the best Productivity & Collaboration tools for teams, startups, and individuals?",
    response_text:
      "For teams and startups, Notion stands out as the most versatile all-in-one workspace — combining docs, databases, wikis and project tracking in a single tool. Slack remains the default for team communication. Asana and Monday.com excel at structured project management. Linear is a favourite among engineering teams. For individuals, Todoist and Things 3 offer clean personal task management.",
    mentioned: true,
    position: 1,
    competitors_mentioned: [
      { name: "Asana",      domain: "asana.com",   position: 3 },
      { name: "Monday.com", domain: "monday.com",  position: 4 },
    ],
    sources: [
      { domain: "g2.com",       title: "Best Productivity Software 2025"           },
      { domain: "capterra.com", title: "Top Collaboration Tools for Teams"         },
    ],
  },

  // 02 — ChatGPT — Competitor — ✓
  {
    prompt: "What are the best alternatives to Trello?",
    response_text:
      "The best Trello alternatives depend on how much structure you need. Notion is the most popular upgrade path — it keeps the kanban simplicity while adding databases, wikis and docs in one workspace. Asana offers more powerful task dependencies and reporting. ClickUp packs in the most features at a low price. Linear is the top choice for software teams. Monday.com suits visual thinkers who want dashboards.",
    mentioned: true,
    position: 1,
    competitors_mentioned: [
      { name: "Asana",   domain: "asana.com",   position: 2 },
      { name: "ClickUp", domain: "clickup.com", position: 3 },
    ],
    sources: [
      { domain: "g2.com",       title: "Best Trello Alternatives 2025"         },
      { domain: "capterra.com", title: "Trello vs Notion – Full Comparison"    },
    ],
  },

  // 03 — ChatGPT — Discovery — ✓
  {
    prompt: "I want to manage our team knowledge base without spending too much time on it. What tool do you recommend and why?",
    response_text:
      "For a low-maintenance team knowledge base, Notion is the top recommendation. Its block-based editor means anyone can write a clean page without training, and the template library gives you a solid structure from day one. Unlike Confluence, which requires admin effort to keep tidy, Notion's flat page hierarchy and sidebar navigation stays intuitive as content grows. Most teams are productive within a day of onboarding.",
    mentioned: true,
    position: 1,
    competitors_mentioned: [
      { name: "Confluence", domain: "confluence.atlassian.com", position: null },
    ],
    sources: [
      { domain: "notion.so",  title: "Notion for Teams – Knowledge Base Templates" },
      { domain: "reddit.com", title: "r/Notion: Setting up a team wiki"            },
    ],
  },

  // 04 — Gemini — Discovery — ✓
  {
    prompt: "I need help with note-taking and knowledge management. What tools do you recommend?",
    response_text:
      "For note-taking and knowledge management, Notion is the most recommended tool for teams — its block editor handles everything from meeting notes to full wikis, and relational databases let you link ideas across pages. For personal knowledge management, Obsidian (local markdown with bidirectional links) and Roam Research (networked thought) are popular among power users. Logseq is a strong open-source option.",
    mentioned: true,
    position: 1,
    competitors_mentioned: [],
    sources: [
      { domain: "notion.so",     title: "Notion for Knowledge Management"         },
      { domain: "obsidian.md",   title: "Obsidian – A second brain for you"       },
    ],
  },

  // 05 — ChatGPT — Direct Brand — ✓
  {
    prompt: "Tell me about Notion — who is it for and what problem does it solve?",
    response_text:
      "Notion is built for anyone who's tired of switching between too many apps to get work done. It solves the fragmentation problem — notes in one app, tasks in another, docs in a third. By combining all of these into one connected workspace, Notion is especially valuable for startups and remote teams who need speed, flexibility and a single source of truth. It scales from a solo founder's second brain to a 500-person company's internal wiki.",
    mentioned: true,
    position: 1,
    competitors_mentioned: [],
    sources: [
      { domain: "notion.so",       title: "Notion – The connected workspace"  },
      { domain: "producthunt.com", title: "Notion – Product of the Year"      },
    ],
  },

  // 06 — ChatGPT — Discovery — ✓
  {
    prompt: "My team needs to organize our documentation more efficiently. What software should we use?",
    response_text:
      "For organising team documentation, Notion is the most popular choice among startups and mid-sized teams. Its hierarchical pages, databases and real-time collaboration make it easy to build a structured wiki that stays up to date. Confluence is worth considering if you're already deep in the Atlassian ecosystem. Slab and Tettra are cleaner alternatives for teams that want a pure knowledge base without extra features.",
    mentioned: true,
    position: 1,
    competitors_mentioned: [
      { name: "Confluence", domain: "confluence.atlassian.com", position: 2 },
    ],
    sources: [
      { domain: "g2.com",       title: "Best Documentation Software 2025" },
      { domain: "capterra.com", title: "Top Knowledge Base Tools for Teams" },
    ],
  },

  // 07 — Gemini — Open Ended — ✗
  {
    prompt: "What Productivity & Collaboration tools would you recommend for teams, startups, and individuals? Include well-known and lesser-known options.",
    response_text:
      "Well-known: Slack (messaging), Asana (project management), Monday.com (visual PM), Confluence (wikis), Google Workspace (docs/sheets). Lesser-known but worth knowing: Linear (fast issue tracking for engineers), Slab (clean team wiki), Height (collaborative project planning), Coda (docs with app-like functionality), Loom (async video updates). The best setup combines a communication tool with a documentation hub and a task tracker.",
    mentioned: false,
    position: null,
    competitors_mentioned: [
      { name: "Asana",      domain: "asana.com",   position: 1 },
      { name: "Monday.com", domain: "monday.com",  position: 2 },
      { name: "Confluence", domain: "confluence.atlassian.com", position: 3 },
    ],
    sources: [
      { domain: "producthunt.com", title: "Top Productivity Tools – Community Picks" },
      { domain: "techradar.com",   title: "Best Collaboration Software 2025"         },
    ],
  },

  // 08 — ChatGPT — Competitor — ✓
  {
    prompt: "Notion vs Trello vs Asana vs Monday.com vs ClickUp vs Confluence — which is best for startups and what are the key differences?",
    response_text:
      "For startups, Notion is the best all-rounder — it combines docs, wikis and databases in one place, grows with the team and has a generous free tier. Trello is the easiest to start with for pure kanban but lacks depth. Asana and Monday.com shine for structured project management with dashboards and reporting. ClickUp offers the most features at the lowest price but has a steep learning curve. Confluence is powerful but overkill without Jira. Most fast-moving startups choose Notion early on.",
    mentioned: true,
    position: 1,
    competitors_mentioned: [
      { name: "Trello",     domain: "trello.com",  position: 2 },
      { name: "Asana",      domain: "asana.com",   position: 3 },
      { name: "Monday.com", domain: "monday.com",  position: 4 },
      { name: "ClickUp",    domain: "clickup.com", position: 5 },
    ],
    sources: [
      { domain: "g2.com",       title: "Best Project Management Tools 2025"      },
      { domain: "capterra.com", title: "Notion vs Trello vs Asana – Full Review"  },
    ],
  },

  // 09 — ChatGPT — Discovery — ✓
  {
    prompt: "I'm a startup founder looking to improve project management. What's the best tool for my situation?",
    response_text:
      "For a startup founder, Notion is usually the best starting point — it gives you project tracking, a company wiki, meeting notes and roadmaps all in one tool without juggling multiple subscriptions. As the team grows, many founders add Linear for engineering issue tracking. If you want something more opinionated for project management specifically, Asana or ClickUp are solid choices with better reporting.",
    mentioned: true,
    position: 1,
    competitors_mentioned: [
      { name: "Asana",   domain: "asana.com",   position: 3 },
      { name: "ClickUp", domain: "clickup.com", position: 4 },
    ],
    sources: [
      { domain: "notion.so",  title: "Notion for Startups – Templates & Guide" },
      { domain: "reddit.com", title: "r/startups: Best PM tools for early stage" },
    ],
  },

  // 10 — Gemini — Discovery — ✗
  {
    prompt: "What Productivity & Collaboration software do most teams, startups, and individuals use today?",
    response_text:
      "Today's most widely used tools: Slack dominates team messaging. Google Workspace (Docs, Sheets, Drive) is the default for document collaboration in most organisations. Asana and Monday.com lead structured project management. Confluence remains the enterprise wiki standard, especially in Atlassian-heavy shops. Jira is used by the majority of engineering teams for issue tracking. Zoom and Google Meet split video conferencing.",
    mentioned: false,
    position: null,
    competitors_mentioned: [
      { name: "Asana",      domain: "asana.com",                  position: 3 },
      { name: "Monday.com", domain: "monday.com",                 position: 4 },
      { name: "Confluence", domain: "confluence.atlassian.com",   position: 5 },
    ],
    sources: [
      { domain: "statista.com",  title: "Most Used Business Software 2025"    },
      { domain: "g2.com",        title: "Market Report: Collaboration Tools"  },
    ],
  },

  // 11 — ChatGPT — Direct Brand — ✓
  {
    prompt: "Is Notion worth it? What do real users say about it?",
    response_text:
      "Real users consistently rate Notion highly for its flexibility and value. On G2 and Capterra, it scores 4.7/5 with praise for the block editor, database functionality and generous free tier. The most common love points: it replaces 3-4 other tools, the template library is excellent, and it scales from personal notes to company-wide wikis. The most common frustrations: the offline mode is limited, and very large databases can feel slow. For most startups and teams, the value is clear.",
    mentioned: true,
    position: 1,
    competitors_mentioned: [],
    sources: [
      { domain: "g2.com",       title: "Notion Reviews – 4.7/5 on G2"           },
      { domain: "capterra.com", title: "Notion User Reviews 2025"                },
      { domain: "reddit.com",   title: "r/Notion: What do you love and hate?"   },
    ],
  },

  // 12 — ChatGPT — Competitor — ✓
  {
    prompt: "I'm evaluating Notion vs Trello — what are the honest pros and cons of each?",
    response_text:
      "Notion pros: far more powerful, combines notes/wikis/databases/tasks, excellent free tier, scales with your needs. Notion cons: steeper learning curve, can feel overwhelming at first, offline is limited. Trello pros: extremely simple to learn, great for visual kanban, fast to set up. Trello cons: limited to boards, no native docs or wikis, gets messy with large projects. Most teams outgrow Trello within 6-12 months and migrate to Notion — the flexibility is worth the initial investment.",
    mentioned: true,
    position: 1,
    competitors_mentioned: [
      { name: "Trello", domain: "trello.com", position: null },
    ],
    sources: [
      { domain: "g2.com",       title: "Notion vs Trello 2025 – Side by Side"     },
      { domain: "capterra.com", title: "Notion vs Trello – Which Should You Pick?" },
    ],
  },

  // 13 — Gemini — Discovery — ✗
  {
    prompt: "What are the top Productivity & Collaboration platforms trusted by teams, startups, and individuals?",
    response_text:
      "The most trusted platforms in 2025: Slack for team communication, Google Workspace for document collaboration and email, Asana for structured project management, Confluence for enterprise wikis, and Zoom for video meetings. Among startups specifically, Linear has become the default engineering tool, and Figma owns design collaboration. These tools consistently top G2 and Gartner rankings for adoption and satisfaction.",
    mentioned: false,
    position: null,
    competitors_mentioned: [
      { name: "Asana",      domain: "asana.com",                position: 3 },
      { name: "Confluence", domain: "confluence.atlassian.com", position: 4 },
    ],
    sources: [
      { domain: "gartner.com", title: "Top Collaboration Platforms 2025 – Gartner" },
      { domain: "g2.com",      title: "Most Trusted Productivity Software"          },
    ],
  },

  // 14 — ChatGPT — Discovery — ✓
  {
    prompt: "What's the fastest way for a startup to get started with task tracking?",
    response_text:
      "For a startup getting started with task tracking, Notion is the fastest path to a working system — its templates give you a complete task database in minutes, and the same workspace holds your docs and wikis. If you only need pure task management, Trello's free kanban board is up and running in under 10 minutes. Linear is the best choice if you're a software team — it has opinionated workflows that match how engineers think.",
    mentioned: true,
    position: 1,
    competitors_mentioned: [
      { name: "Trello", domain: "trello.com", position: 2 },
    ],
    sources: [
      { domain: "notion.so",  title: "Notion Task Tracking Templates"         },
      { domain: "reddit.com", title: "r/startups: Best free task tracking tools" },
    ],
  },

  // 15 — ChatGPT — Discovery — ✗
  {
    prompt: "What Productivity & Collaboration tool works best for teams, startups, and individuals who need to do note-taking?",
    response_text:
      "For pure note-taking, Obsidian is the top pick among power users for its local-first markdown and bidirectional links. Bear is the best option for Apple users who want a clean, distraction-free writing experience. Roam Research suits researchers and thinkers who want networked notes. For team note-taking specifically, Slab and Tettra are purpose-built for structured, searchable team knowledge.",
    mentioned: false,
    position: null,
    competitors_mentioned: [],
    sources: [
      { domain: "obsidian.md",     title: "Obsidian – A second brain for you"     },
      { domain: "producthunt.com", title: "Best Note-Taking Apps 2025"            },
    ],
  },

  // 16 — Gemini — Open Ended — ✓
  {
    prompt: "What are the most popular Productivity & Collaboration platforms among teams, startups, and individuals right now and why do people choose them?",
    response_text:
      "The most popular platforms right now: Notion for all-in-one workspace (people choose it to consolidate tools), Slack for communication (default for any tech team), Linear for engineering (fast, opinionated, loved by developers), Figma for design (the standard for product teams), and Monday.com for cross-team project visibility. Notion's growth is particularly notable — it's replaced Confluence, Trello and Google Docs for many teams because it does all three in one place.",
    mentioned: true,
    position: 1,
    competitors_mentioned: [
      { name: "Monday.com", domain: "monday.com", position: 4 },
    ],
    sources: [
      { domain: "techcrunch.com",  title: "The productivity tools startups love in 2025" },
      { domain: "g2.com",          title: "Trending Software – Q1 2025"                  },
    ],
  },

  // 17 — ChatGPT — Discovery — ✓
  {
    prompt: "We're a startup looking for a Productivity & Collaboration solution. What do you recommend?",
    response_text:
      "For a startup, Notion is the most recommended starting point — it gives you docs, wikis, project tracking and databases in one tool, which means fewer subscriptions and less context switching. Start with a free account and use the startup template pack. As you grow, add Slack for communication and Linear for engineering issues. Avoid over-engineering your stack early — Notion alone handles most startup needs up to 50 people.",
    mentioned: true,
    position: 1,
    competitors_mentioned: [],
    sources: [
      { domain: "notion.so",  title: "Notion for Startups – Free templates"     },
      { domain: "reddit.com", title: "r/startups: What tools do you actually use?" },
    ],
  },

  // 18 — ChatGPT — Discovery — ✗
  {
    prompt: "What tools do teams, startups, and individuals commonly use to handle note-taking as they grow?",
    response_text:
      "As teams grow, note-taking needs shift from personal to collaborative. Early stage startups often use Google Docs for simplicity. Engineering teams frequently adopt Confluence for structured documentation alongside Jira. High-growth companies tend to consolidate on Google Workspace or Microsoft 365 for document collaboration at scale, supplemented with dedicated wiki tools for long-form knowledge.",
    mentioned: false,
    position: null,
    competitors_mentioned: [
      { name: "Confluence", domain: "confluence.atlassian.com", position: 2 },
    ],
    sources: [
      { domain: "atlassian.com", title: "State of Teams Report 2025"          },
      { domain: "g2.com",        title: "Knowledge Management Tools by Stage" },
    ],
  },

  // 19 — Gemini — Discovery — ✓
  {
    prompt: "Which Productivity & Collaboration tools are gaining traction among teams, startups, and individuals right now?",
    response_text:
      "The tools gaining the most traction right now: Notion continues its growth as startups consolidate their stack into one workspace. Linear is becoming the default for engineering issue tracking, taking share from Jira. Loom is spreading for async video updates. Granola is emerging as a popular AI meeting notes tool. Among individuals, Reflect is gaining a following for networked note-taking.",
    mentioned: true,
    position: 1,
    competitors_mentioned: [],
    sources: [
      { domain: "producthunt.com", title: "Top Growing Tools – April 2025"      },
      { domain: "techcrunch.com",  title: "The software startups are switching to" },
    ],
  },

  // 20 — ChatGPT — Discovery — ✗
  {
    prompt: "What Productivity & Collaboration tool would you recommend to teams, startups, and individuals who are just getting started?",
    response_text:
      "For someone just getting started with productivity tools, Google Workspace is the easiest entry point — Docs, Sheets and Drive are familiar, free and require no learning curve. Trello's free kanban board is perfect for simple task management. For communication, Slack's free tier handles small team messaging well. These three tools cover most early-stage needs without overwhelming a first-time user.",
    mentioned: false,
    position: null,
    competitors_mentioned: [
      { name: "Trello", domain: "trello.com", position: 2 },
    ],
    sources: [
      { domain: "zapier.com",      title: "Best Free Productivity Tools for Beginners" },
      { domain: "techradar.com",   title: "Getting Started with Team Collaboration"    },
    ],
  },

  // 21 — ChatGPT — Discovery — ✓
  {
    prompt: "What's the best Productivity & Collaboration setup for teams, startups, and individuals who want to move fast and stay organised?",
    response_text:
      "The most effective setup for fast-moving teams: Notion as the central knowledge hub and project tracker, Slack for real-time communication, and Linear for engineering issues. This combination covers docs, wikis, tasks and communication without overlap. For non-engineering teams, swap Linear for Asana. The key is a single source of truth — Notion fills that role for most startups because it's flexible enough to adapt as priorities shift.",
    mentioned: true,
    position: 1,
    competitors_mentioned: [
      { name: "Asana", domain: "asana.com", position: null },
    ],
    sources: [
      { domain: "notion.so",    title: "Notion for Fast-Moving Teams"          },
      { domain: "atlassian.com",title: "Team Setup Guide for Startups 2025"    },
    ],
  },

  // 22 — Gemini — Open Ended — ✓
  {
    prompt: "If you were a startup founder starting fresh today, what Productivity & Collaboration tool would you choose and why?",
    response_text:
      "Starting fresh today, I'd choose Notion as the foundation. It covers everything a founding team needs — meeting notes, product roadmap, company wiki, onboarding docs and task tracking — in one tool. The free tier is genuinely useful, the template library accelerates setup, and it scales cleanly to 50+ people. I'd add Slack for communication and Linear once engineering was hired. The goal is to avoid tool sprawl early — Notion handles it all.",
    mentioned: true,
    position: 1,
    competitors_mentioned: [],
    sources: [
      { domain: "notion.so",  title: "Notion for Startups"                  },
      { domain: "reddit.com", title: "r/startups: What I wish I knew earlier" },
    ],
  },

  // 23 — Gemini — Open Ended — ✗
  {
    prompt: "What's the honest truth about the best Productivity & Collaboration tools available — what do people love and what frustrates them?",
    response_text:
      "Honest takes: Slack is loved for speed but hated for notification overload and information that disappears into threads. Google Docs is reliable but lacks structure for large knowledge bases. Asana is powerful but many teams use 20% of its features. Monday.com is visually impressive but can feel bloated. Confluence is comprehensive but notoriously hard to keep tidy — pages go stale fast. The honest truth is that no tool solves the underlying problem of team discipline around documentation.",
    mentioned: false,
    position: null,
    competitors_mentioned: [
      { name: "Asana",      domain: "asana.com",                position: 2 },
      { name: "Monday.com", domain: "monday.com",               position: 3 },
      { name: "Confluence", domain: "confluence.atlassian.com", position: 4 },
    ],
    sources: [
      { domain: "reddit.com",   title: "r/productivity: Honest tool reviews"       },
      { domain: "hackernews.com",title: "Ask HN: What productivity tool do you regret?" },
    ],
  },

  // 24 — Gemini — Discovery — ✓
  {
    prompt: "What's the go-to Productivity & Collaboration tool for teams, startups, and individuals at a fast-growing company?",
    response_text:
      "At fast-growing companies, Notion has become the go-to workspace. It scales from a 5-person founding team to hundreds of employees without breaking — companies like Figma, Loom and Vercel have used Notion as their company wiki and project hub. The combination of flexible databases, nested pages and real-time collaboration makes it uniquely suited to high-growth environments where structure needs to evolve quickly.",
    mentioned: true,
    position: 1,
    competitors_mentioned: [],
    sources: [
      { domain: "notion.so",     title: "Notion for Enterprise – Case Studies"  },
      { domain: "techcrunch.com",title: "How fast-growing startups stay organised" },
    ],
  },
];

// Notion: 18 mentions → #1 ranked
export const DEMO_COMPETITOR_RANKINGS: CompetitorRanking[] = [
  { name: "Trello",      domain: "trello.com",                 mentions: 5, avg_position: 3.2 },
  { name: "Asana",       domain: "asana.com",                  mentions: 6, avg_position: 2.8 },
  { name: "Monday.com",  domain: "monday.com",                 mentions: 5, avg_position: 3.5 },
  { name: "ClickUp",     domain: "clickup.com",                mentions: 3, avg_position: 4.0 },
  { name: "Confluence",  domain: "confluence.atlassian.com",   mentions: 6, avg_position: 2.3 },
];

export const DEMO_AUDIT_RESULT = {
  score: 72,
  total_mentions: 18,
  prompt_results: DEMO_PROMPT_RESULTS,
  competitor_rankings: DEMO_COMPETITOR_RANKINGS,
};

export const DEMO_THREADS = [
  {
    id: "dt1",
    subreddit: "r/Notion",
    title: "What's the best way to set up a team knowledge base — Notion or Confluence?",
    url: "https://reddit.com/r/Notion",
    upvotes: 1847,
    comments: 142,
    age: "2 days",
  },
  {
    id: "dt2",
    subreddit: "r/startups",
    title: "We replaced Confluence, Trello and Google Docs with Notion — was it worth it?",
    url: "https://reddit.com/r/startups",
    upvotes: 3204,
    comments: 267,
    age: "4 days",
  },
  {
    id: "dt3",
    subreddit: "r/remotework",
    title: "Best tools for async documentation in a fully distributed team?",
    url: "https://reddit.com/r/remotework",
    upvotes: 892,
    comments: 78,
    age: "1 day",
  },
  {
    id: "dt4",
    subreddit: "r/projectmanagement",
    title: "Notion vs Monday.com for a 20-person engineering team — honest opinions?",
    url: "https://reddit.com/r/projectmanagement",
    upvotes: 1423,
    comments: 189,
    age: "5 days",
  },
  {
    id: "dt5",
    subreddit: "r/SaaS",
    title: "Anyone using Notion as their main CRM? Is it actually viable at scale?",
    url: "https://reddit.com/r/SaaS",
    upvotes: 674,
    comments: 91,
    age: "3 days",
  },
  {
    id: "dt6",
    subreddit: "r/Entrepreneur",
    title: "Struggling to keep our team docs organised — is Notion the answer or is it overhyped?",
    url: "https://reddit.com/r/Entrepreneur",
    upvotes: 2156,
    comments: 203,
    age: "6 days",
  },
  {
    id: "dt7",
    subreddit: "r/webdev",
    title: "Replacing our internal wiki — Notion vs Confluence vs Slab — our experience",
    url: "https://reddit.com/r/webdev",
    upvotes: 1089,
    comments: 134,
    age: "3 days",
  },
  {
    id: "dt8",
    subreddit: "r/productivity",
    title: "Has anyone successfully replaced Jira with Notion for sprint planning?",
    url: "https://reddit.com/r/productivity",
    upvotes: 784,
    comments: 56,
    age: "1 day",
  },
  {
    id: "dt9",
    subreddit: "r/nocode",
    title: "Building a client-facing portal in Notion — tips, templates and gotchas",
    url: "https://reddit.com/r/nocode",
    upvotes: 1312,
    comments: 88,
    age: "4 days",
  },
  {
    id: "dt10",
    subreddit: "r/Notion",
    title: "How do you stop Notion from becoming a graveyard of half-finished pages?",
    url: "https://reddit.com/r/Notion",
    upvotes: 2891,
    comments: 312,
    age: "7 days",
  },
];

export const DEMO_PLAYBOOK_DATA: CompetitorMentions[] = [
  {
    name: "Asana",
    domain: "asana.com",
    mentions: 6,
    results: [
      {
        url: "https://www.reddit.com/r/projectmanagement/comments/notion_vs_asana/",
        title: "Notion vs Asana for product teams — what's your experience?",
        description: "We've been using Asana for 2 years but considering switching to Notion. Anyone made this switch and regretted it?",
        domain: "reddit.com",
        category: "reddit",
      },
      {
        url: "https://www.reddit.com/r/Asana/comments/asana_alternatives_wiki/",
        title: "r/Asana: Looking for something that combines project tracking with docs",
        description: "Asana is great for tasks but we keep bouncing between it and Confluence for documentation. Is Notion a better fit?",
        domain: "reddit.com",
        category: "reddit",
      },
      {
        url: "https://www.g2.com/products/asana/reviews",
        title: "Asana Reviews 2025 — G2",
        description: "4.4/5 stars · 12,400+ reviews · #1 in Project Management Software on G2",
        domain: "g2.com",
        category: "review",
      },
      {
        url: "https://www.capterra.com/project-management-software/asana",
        title: "Asana Software Reviews, Demo & Pricing — Capterra",
        description: "Read real Asana reviews. See ratings, pricing and side-by-side comparisons with top alternatives.",
        domain: "capterra.com",
        category: "review",
      },
      {
        url: "https://zapier.com/blog/best-asana-alternatives/",
        title: "The 10 Best Asana Alternatives in 2025",
        description: "Looking for an Asana replacement? We compared the top project management tools including Notion, ClickUp, and Monday.com.",
        domain: "zapier.com",
        category: "press",
      },
      {
        url: "https://techcrunch.com/2025/03/15/asana-ai-work-graph/",
        title: "Asana's AI-powered Work Graph is reshaping how teams manage projects",
        description: "Asana rolls out AI features across its platform as the race to automate knowledge work intensifies.",
        domain: "techcrunch.com",
        category: "press",
      },
    ],
  },
  {
    name: "Confluence",
    domain: "confluence.atlassian.com",
    mentions: 6,
    results: [
      {
        url: "https://www.reddit.com/r/confluence/comments/moving_to_notion/",
        title: "r/Confluence: Moving from Confluence to Notion after 5 years — tips?",
        description: "After 5 years on Confluence, our 60-person startup is migrating. Anyone else done this? What did you wish you knew?",
        domain: "reddit.com",
        category: "reddit",
      },
      {
        url: "https://www.reddit.com/r/devops/comments/best_wiki_2025/",
        title: "r/devops: Best internal wiki for a 50-person engineering org in 2025",
        description: "Evaluating docs tools. Confluence vs Notion vs Slab — we want something engineers will actually use.",
        domain: "reddit.com",
        category: "reddit",
      },
      {
        url: "https://www.g2.com/products/confluence/reviews",
        title: "Confluence Reviews 2025 — G2",
        description: "4.1/5 stars · 15,200+ reviews · Team Collaboration Software · Compare with Notion",
        domain: "g2.com",
        category: "review",
      },
      {
        url: "https://www.trustradius.com/products/confluence/reviews",
        title: "Confluence Reviews & Ratings 2025 — TrustRadius",
        description: "In-depth expert reviews and user ratings for enterprise wiki and knowledge management tools.",
        domain: "trustradius.com",
        category: "review",
      },
      {
        url: "https://www.infoq.com/articles/confluence-vs-notion-enterprise/",
        title: "Confluence vs Notion: Which Wiki Wins for Enterprise Teams in 2025?",
        description: "A detailed comparison of two leading knowledge management platforms — setup costs, scalability, and real team feedback.",
        domain: "infoq.com",
        category: "press",
      },
      {
        url: "https://slab.com/blog/confluence-alternatives/",
        title: "The Best Confluence Alternatives for Your Team — Slab",
        description: "If Confluence is feeling bloated, here are the top alternatives based on real migration stories and team feedback.",
        domain: "slab.com",
        category: "press",
      },
    ],
  },
  {
    name: "Trello",
    domain: "trello.com",
    mentions: 5,
    results: [
      {
        url: "https://www.reddit.com/r/Trello/comments/moved_to_notion/",
        title: "r/Trello: Why I moved from Trello to Notion and never looked back",
        description: "After 3 years of Trello, here's why Notion's flexibility was worth the migration effort — and what I miss.",
        domain: "reddit.com",
        category: "reddit",
      },
      {
        url: "https://www.reddit.com/r/productivity/comments/trello_vs_notion_2025/",
        title: "r/productivity: Trello vs Notion for a solo founder — 2025 honest take",
        description: "Starting a new project, debating between keeping Trello simple or going full Notion. What would you pick?",
        domain: "reddit.com",
        category: "reddit",
      },
      {
        url: "https://www.pcmag.com/reviews/trello",
        title: "Trello Review 2025 — PCMag",
        description: "The classic kanban board app holds up in 2025. Editors' Choice — 4.0/5 stars. Best for visual task management.",
        domain: "pcmag.com",
        category: "review",
      },
      {
        url: "https://www.g2.com/products/trello/reviews",
        title: "Trello Reviews 2025 — G2",
        description: "4.4/5 stars · 13,600+ reviews · See how Trello compares to Notion, Asana and ClickUp.",
        domain: "g2.com",
        category: "review",
      },
      {
        url: "https://www.wired.com/story/best-project-management-apps-2025/",
        title: "The Best Project Management Apps in 2025 — WIRED",
        description: "We tested dozens of project management tools. Trello, Notion, Asana — here are the ones actually worth your time.",
        domain: "wired.com",
        category: "press",
      },
    ],
  },
];

export const DEMO_QUORA_THREADS = [
  {
    id: "dq1",
    title: "What is the best way to use Notion for managing a startup team?",
    url: "https://www.quora.com/What-is-the-best-way-to-use-Notion-for-managing-a-startup-team",
  },
  {
    id: "dq2",
    title: "How does Notion compare to Confluence for team documentation and wikis?",
    url: "https://www.quora.com/How-does-Notion-compare-to-Confluence-for-team-documentation",
  },
  {
    id: "dq3",
    title: "What are the best alternatives to Notion for knowledge management?",
    url: "https://www.quora.com/What-are-the-best-alternatives-to-Notion-for-knowledge-management",
  },
  {
    id: "dq4",
    title: "How do I set up Notion as a project management tool for my remote team?",
    url: "https://www.quora.com/How-do-I-set-up-Notion-as-a-project-management-tool-for-my-remote-team",
  },
  {
    id: "dq5",
    title: "Is Notion worth using for a small business — what are the real limitations?",
    url: "https://www.quora.com/Is-Notion-worth-using-for-a-small-business",
  },
  {
    id: "dq6",
    title: "What are the most creative ways people use Notion databases?",
    url: "https://www.quora.com/What-are-the-most-creative-ways-people-use-Notion-databases",
  },
  {
    id: "dq7",
    title: "How does Notion compare to Trello for task and project management?",
    url: "https://www.quora.com/How-does-Notion-compare-to-Trello-for-task-and-project-management",
  },
  {
    id: "dq8",
    title: "What problems do teams typically run into when switching to Notion?",
    url: "https://www.quora.com/What-problems-do-teams-typically-run-into-when-switching-to-Notion",
  },
  {
    id: "dq9",
    title: "How do you build a company wiki in Notion that people actually use?",
    url: "https://www.quora.com/How-do-you-build-a-company-wiki-in-Notion-that-people-actually-use",
  },
  {
    id: "dq10",
    title: "What makes Notion better than Google Docs for team collaboration?",
    url: "https://www.quora.com/What-makes-Notion-better-than-Google-Docs-for-team-collaboration",
  },
];
