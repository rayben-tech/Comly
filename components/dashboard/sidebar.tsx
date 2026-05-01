"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, LayoutDashboard, MessageSquare, Globe,
  ListChecks, ChevronDown, ChevronRight, Tag, Radio, Swords, PanelLeftClose,
} from "lucide-react";
import { BrandProfile } from "@/types";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "prompts",  label: "Prompts",  icon: MessageSquare },
  { id: "sources",  label: "Sources",  icon: Globe },
];

const FIXES_ITEMS = [
  { id: "listicles",        label: "Listicles Generator", badge: ""    },
  { id: "llms-txt",         label: "llms.txt Generator",  badge: ""    },
  { id: "comparison",       label: "Comparison Pages",    badge: ""    },
  { id: "hero-rewrite",     label: "Hero Rewrite",        badge: ""    },
  { id: "g2-checklist",     label: "G2 Checklist",        badge: "Pro" },
  { id: "reddit-exposure",  label: "Reddit Exposure",     badge: "Pro" },
];

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
  profile: BrandProfile;
  className?: string;
  onClose?: () => void;
}

function domainFromUrl(url: string): string {
  if (!url) return "";
  try {
    const u = url.startsWith("http") ? url : "https://" + url;
    return new URL(u).hostname;
  } catch {
    return url.toLowerCase().replace(/\s+/g, "").replace(/[^a-z0-9.]/g, "") + ".com";
  }
}

function BrandFavicon({ domain, name, size = 32 }: { domain: string; name: string; size?: number }) {
  const [err, setErr] = useState(false);
  if (err || !domain) {
    return (
      <div
        className="rounded-xl bg-gradient-to-br from-[#5B2D91] to-[#8B5CF6] flex items-center justify-center text-white font-bold shrink-0"
        style={{ width: size, height: size, fontSize: size * 0.4 }}
      >
        {name.charAt(0).toUpperCase()}
      </div>
    );
  }
  return (
    <img
      src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`}
      alt={name}
      width={size}
      height={size}
      className="rounded-xl object-contain shrink-0"
      onError={() => setErr(true)}
    />
  );
}

export function Sidebar({ activePage, onNavigate, profile, className, onClose }: SidebarProps) {
  const domain = domainFromUrl(profile.url || "");
  const [query, setQuery] = useState("");
  const isFixesActive = activePage.startsWith("fixes:");
  const [fixesOpen, setFixesOpen] = useState(isFixesActive);

  const allNavItems = [
    ...NAV_ITEMS,
    { id: "fixes", label: "Fixes", icon: ListChecks },
    ...FIXES_ITEMS.map((f) => ({ id: `fixes:${f.id}`, label: f.label, icon: ListChecks })),
    { id: "crawlers", label: "Crawlers", icon: Radio },
    { id: "competitor-playbook", label: "Competitor Playbook", icon: Swords },
    { id: "brand", label: "Brand", icon: Tag },
  ];

  const filteredNav = query.trim()
    ? allNavItems.filter((item) => item.label.toLowerCase().includes(query.toLowerCase()))
    : null;

  function handleFixesNavClick(id: string) {
    onNavigate(`fixes:${id}`);
    setFixesOpen(true);
  }

  return (
    <aside className={cn("w-[220px] shrink-0 bg-white border-r border-[#ebebeb] flex flex-col h-screen sticky top-0 overflow-hidden", className)}>

      {/* Brand header */}
      <div className="px-3 pt-4 pb-3 border-b border-[#f0f0f0]">
        <div className="bg-[#f7f7f5] border border-[#ececec] rounded-xl px-3 py-2.5 flex items-center gap-2.5">
          <BrandFavicon domain={domain} name={profile.brand_name} size={36} />
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-bold text-[#0a0a0a] truncate leading-tight">{profile.brand_name}</p>
            {domain && (
              <p className="text-[11px] text-[#aaaaaa] truncate mt-0.5 leading-tight">{domain}</p>
            )}
          </div>
          <button
            onClick={onClose}
            title="Collapse sidebar"
            className="shrink-0 text-[#cccccc] hover:text-[#5B2D91] transition-colors p-1 rounded-lg hover:bg-[#ede8f7]"
          >
            <PanelLeftClose className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="px-4 py-3">
        <div className={`flex items-center gap-2 px-3 bg-[#f7f7f5] border rounded-lg h-8 transition-colors ${query ? "border-[#5B2D91]/40" : "border-[#ebebeb] hover:border-[#d0d0d0]"}`}>
          <Search className="w-3.5 h-3.5 text-[#cccccc] shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Quick Actions"
            className="flex-1 bg-transparent text-[13px] text-[#0a0a0a] placeholder:text-[#cccccc] outline-none min-w-0"
          />
          {query && (
            <button onClick={() => setQuery("")} className="text-[#cccccc] hover:text-[#888] transition-colors text-[16px] leading-none shrink-0">
              ×
            </button>
          )}
        </div>
      </div>

      {/* Nav */}
      <div className="px-3 flex-1 overflow-y-auto">
        <p className="text-[10px] font-bold text-[#cccccc] uppercase tracking-[0.14em] px-2 mb-2 mt-1">
          Pages
        </p>

        {/* Search results */}
        {filteredNav ? (
          <nav className="space-y-0.5">
            {filteredNav.length > 0 ? filteredNav.map(({ id, label, icon: Icon }) => {
              const active = activePage === id;
              const isFixesSub = id.startsWith("fixes:") && id !== "fixes";
              const fixId = id.replace("fixes:", "");
              const badge = isFixesSub
                ? (FIXES_ITEMS.find((f) => f.id === fixId)?.badge ?? "")
                : id === "crawlers" ? "Pro" : "";
              const locked = false;
              return (
                <button
                  key={id}
                  disabled={locked}
                  onClick={() => {
                    if (locked) return;
                    if (isFixesSub) {
                      handleFixesNavClick(fixId);
                    } else if (id !== "fixes") {
                      onNavigate(id);
                    }
                    setQuery("");
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-[7px] rounded-lg text-left text-[13px] font-medium transition-all ${
                    active
                      ? "bg-[#5B2D91] text-white shadow-sm"
                      : locked
                      ? "text-[#cccccc] cursor-default"
                      : "text-[#666] hover:bg-[#f7f7f5] hover:text-[#0a0a0a]"
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${active ? "text-white/80" : "text-[#bbb]"}`} />
                  {label}
                  {badge && (
                    <span className={`ml-auto text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${active ? "bg-white/20 text-white" : "bg-amber-50 text-amber-600"}`}>
                      {badge}
                    </span>
                  )}
                </button>
              );
            }) : (
              <p className="text-[12px] text-[#cccccc] px-3 py-2">No results</p>
            )}
          </nav>
        ) : (
          <nav className="space-y-0.5">
            {/* Regular nav items (no Fixes) */}
            {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
              const active = activePage === id;
              return (
                <button
                  key={id}
                  onClick={() => onNavigate(id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-[7px] rounded-lg text-left text-[13px] font-medium transition-all ${
                    active
                      ? "bg-[#5B2D91] text-white shadow-sm"
                      : "text-[#666] hover:bg-[#f7f7f5] hover:text-[#0a0a0a]"
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${active ? "text-white/80" : "text-[#bbb]"}`} />
                  {label}
                </button>
              );
            })}

            {/* Fixes accordion */}
            <div>
              <button
                onClick={() => setFixesOpen((v) => !v)}
                className={`w-full flex items-center gap-2.5 px-3 py-[7px] rounded-lg text-left text-[13px] font-medium transition-all ${
                  isFixesActive
                    ? "text-[#5B2D91]"
                    : "text-[#666] hover:bg-[#f7f7f5] hover:text-[#0a0a0a]"
                }`}
              >
                <ListChecks className={`w-4 h-4 shrink-0 ${isFixesActive ? "text-[#5B2D91]" : "text-[#bbb]"}`} />
                <span className="flex-1 text-left">Fixes</span>
                {fixesOpen
                  ? <ChevronDown className="w-3.5 h-3.5 text-[#aaaaaa]" />
                  : <ChevronRight className="w-3.5 h-3.5 text-[#aaaaaa]" />
                }
              </button>

              <AnimatePresence initial={false}>
                {fixesOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.18, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="mt-0.5 space-y-0.5 pb-1">
                      {FIXES_ITEMS.map((item) => {
                        const isActive = activePage === `fixes:${item.id}`;
                        return (
                          <button
                            key={item.id}
                            onClick={() => handleFixesNavClick(item.id)}
                            className={`w-full relative flex items-center justify-between pl-9 pr-3 py-[7px] rounded-lg text-left text-[13px] font-medium transition-all ${
                              isActive
                                ? "text-[#5B2D91] bg-[#5B2D91]/[0.04]"
                                : "text-[#666] hover:bg-[#f7f7f5] hover:text-[#0a0a0a]"
                            }`}
                          >
                            {isActive && (
                              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-[#5B2D91] rounded-full" />
                            )}
                            <span>{item.label}</span>
                            {item.badge && (
                              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${isActive ? "bg-[#5B2D91]/10 text-[#5B2D91]" : "bg-amber-50 text-amber-600"}`}>
                                {item.badge}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Crawlers — Pro */}
            {(() => {
              const active = activePage === "crawlers";
              return (
                <button
                  onClick={() => onNavigate("crawlers")}
                  className={`w-full flex items-center gap-2.5 px-3 py-[7px] rounded-lg text-left text-[13px] font-medium transition-all ${
                    active
                      ? "bg-[#5B2D91] text-white shadow-sm"
                      : "text-[#666] hover:bg-[#f7f7f5] hover:text-[#0a0a0a]"
                  }`}
                >
                  <Radio className={`w-4 h-4 shrink-0 ${active ? "text-white/80" : "text-[#bbb]"}`} />
                  <span className="flex-1 text-left">Crawlers</span>
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${active ? "bg-white/20 text-white" : "bg-amber-50 text-amber-600"}`}>
                    Pro
                  </span>
                </button>
              );
            })()}

            {/* Competitor Playbook — Pro */}
            {(() => {
              const active = activePage === "competitor-playbook";
              return (
                <button
                  onClick={() => onNavigate("competitor-playbook")}
                  className={`w-full flex items-center gap-2.5 px-3 py-[7px] rounded-lg text-left text-[13px] font-medium transition-all ${
                    active
                      ? "bg-[#5B2D91] text-white shadow-sm"
                      : "text-[#666] hover:bg-[#f7f7f5] hover:text-[#0a0a0a]"
                  }`}
                >
                  <Swords className={`w-4 h-4 shrink-0 ${active ? "text-white/80" : "text-[#bbb]"}`} />
                  <span className="flex-1 text-left">Competitor Playbook</span>
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${active ? "bg-white/20 text-white" : "bg-amber-50 text-amber-600"}`}>
                    Pro
                  </span>
                </button>
              );
            })()}

            {/* Brand — last */}
            {(() => {
              const active = activePage === "brand";
              return (
                <button
                  onClick={() => onNavigate("brand")}
                  className={`w-full flex items-center gap-2.5 px-3 py-[7px] rounded-lg text-left text-[13px] font-medium transition-all ${
                    active
                      ? "bg-[#5B2D91] text-white shadow-sm"
                      : "text-[#666] hover:bg-[#f7f7f5] hover:text-[#0a0a0a]"
                  }`}
                >
                  <Tag className={`w-4 h-4 shrink-0 ${active ? "text-white/80" : "text-[#bbb]"}`} />
                  Brand
                </button>
              );
            })()}
          </nav>
        )}
      </div>

      {/* Footer */}
      <div className="px-3 pb-4 pt-3 border-t border-[#f0f0f0]">
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg">
          <svg width="28" height="28" viewBox="0 0 100 110" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
            <path d="M50 4 C54 4 57 6 59.5 10 L93 68 C97 74 97 80 93.5 85 C90 90 84 93 77 93 L23 93 C16 93 10 90 6.5 85 C3 80 3 74 7 68 L40.5 10 C43 6 46 4 50 4Z" fill="#1a1a2e" />
            <path d="M28 72 C32 62 44 56 58 60 C66 62.5 70 67 68 70 C66 73 60 72 52 69 C44 66 36 68 32 74 C30 77 28 75 28 72Z" fill="url(#swooshGradSidebar)" />
            <defs>
              <linearGradient id="swooshGradSidebar" x1="28" y1="65" x2="70" y2="65" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#5b21b6" />
                <stop offset="100%" stopColor="#a855f7" />
              </linearGradient>
            </defs>
          </svg>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-[#0a0a0a] truncate">Comly</p>
            <p className="text-[11px] text-[#aaaaaa] truncate">Free plan</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
