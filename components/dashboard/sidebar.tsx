"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, MessageSquare, Globe,
  ListChecks, ChevronDown, ChevronRight, Tag, Radio, Swords, ChevronsUpDown, Lock, PanelLeftClose, PanelLeftOpen, Clock,
} from "lucide-react";
import { BrandProfile } from "@/types";
import { cn } from "@/lib/utils";

const BRAND_CONTENT_ITEMS = [
  { id: "listicles",  label: "Listicles Generator", badge: "" },
  { id: "llms-txt",  label: "llms.txt Generator",  badge: "" },
  { id: "comparison", label: "Comparison Pages",    badge: "" },
];

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
  profile: BrandProfile;
  className?: string;
  onClose?: () => void;
  onOpen?: () => void;
  collapsed?: boolean;
  demoMode?: boolean;
}

function LockedNavItem({
  icon: Icon,
  imgSrc,
  label,
  indent = false,
  title = "Available on actual audit",
}: {
  icon?: React.ElementType;
  imgSrc?: string;
  label: string;
  indent?: boolean;
  title?: string;
}) {
  return (
    <div
      title={title}
      className={cn(
        "w-full flex items-center gap-2.5 py-[7px] rounded-lg text-[13px] font-medium text-[#c4c4c4] cursor-not-allowed select-none",
        indent ? "pl-8 pr-3" : "px-3"
      )}
    >
      {imgSrc ? (
        <img src={imgSrc} width={16} height={16} className="w-4 h-4 shrink-0 rounded-sm grayscale opacity-40" alt="" />
      ) : Icon ? (
        <Icon className="w-4 h-4 shrink-0 text-[#d4d4d4]" />
      ) : null}
      <span className="flex-1 truncate">{label}</span>
      <Lock className="w-3 h-3 text-[#d4d4d4]" />
    </div>
  );
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

function NavItem({
  active,
  onClick,
  icon: Icon,
  imgSrc,
  label,
  badge,
  indent = false,
}: {
  active: boolean;
  onClick: () => void;
  icon?: React.ElementType;
  imgSrc?: string;
  label: string;
  badge?: string;
  indent?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative w-full flex items-center gap-2.5 py-[7px] rounded-lg text-left text-[13px] font-medium transition-colors",
        indent ? "pl-8 pr-3" : "px-3",
        active ? "text-[#5B2D91]" : "text-[#6b7280] hover:bg-[#f7f7f5] hover:text-[#0a0a0a]"
      )}
    >
      {active && (
        <motion.div
          layoutId="nav-bg"
          className="absolute inset-0 rounded-lg bg-[#f3eeff]"
          transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
        />
      )}
      {active && (
        <motion.span
          layoutId="nav-indicator"
          className="absolute left-0 inset-y-[5px] w-[3px] bg-[#5B2D91] rounded-r-full"
          style={{ zIndex: 1 }}
          transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
        />
      )}
      <span className="relative z-[1] flex items-center gap-2.5 flex-1 min-w-0">
        {imgSrc ? (
          <img
            src={imgSrc}
            width={16} height={16}
            className="w-4 h-4 shrink-0 rounded-sm"
            style={{ filter: active ? "none" : "grayscale(1)", opacity: active ? 1 : 0.5 }}
            alt=""
          />
        ) : Icon ? (
          <Icon className={cn("w-4 h-4 shrink-0", active ? "text-[#5B2D91]" : "text-[#9ca3af]")} />
        ) : null}
        <span className="flex-1 truncate">{label}</span>
      </span>
      {badge && (
        <span className={cn(
          "relative z-[1] shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded-full",
          badge === "Pro"
            ? "bg-amber-50 text-amber-600 border border-amber-100"
            : active ? "text-[#5B2D91]/60" : "text-[#9ca3af]"
        )}>
          {badge}
        </span>
      )}
    </button>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-[0.12em] px-2 mb-1.5">
      {children}
    </p>
  );
}

function IconBtn({
  title,
  active = false,
  disabled = false,
  onClick,
  children,
}: {
  title: string;
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "w-8 h-8 flex items-center justify-center rounded-lg transition-colors",
        disabled
          ? "cursor-not-allowed opacity-40 text-[#d4d4d4]"
          : active
          ? "bg-[#f3eeff] text-[#5B2D91]"
          : "text-[#9ca3af] hover:bg-[#f7f7f5] hover:text-[#0a0a0a]"
      )}
    >
      {children}
    </button>
  );
}

export function Sidebar({ activePage, onNavigate, profile, className, onClose, onOpen, collapsed, demoMode }: SidebarProps) {
  const domain = domainFromUrl(profile.url || "");
  const isFixesActive = activePage.startsWith("fixes:");
  const [brandContentOpen, setBrandContentOpen] = useState(isFixesActive);

  return (
    <aside className={cn(
      "w-full shrink-0 bg-white flex flex-col sticky top-0 overflow-hidden border-r border-[#e5e5e5]",
      demoMode ? "h-full" : "h-screen",
      className
    )}>
      <AnimatePresence mode="wait" initial={false}>
        {collapsed ? (
          <motion.div
            key="collapsed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12, ease: "easeInOut" }}
            className="flex flex-col h-full"
          >
            {/* Brand favicon + expand button */}
            <div className="flex flex-col items-center gap-1.5 pt-3 pb-2.5 border-b border-[#f0f0f0]">
              <BrandFavicon domain={domain} name={profile.brand_name} size={28} />
              {onOpen && (
                <button
                  onClick={onOpen}
                  title="Expand sidebar"
                  className="flex items-center justify-center w-7 h-7 rounded-md text-[#9ca3af] hover:text-[#5B2D91] hover:bg-[#f3eeff] transition-colors"
                >
                  <PanelLeftOpen className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Icon nav */}
            <div className="flex-1 overflow-y-auto py-3 flex flex-col items-center gap-0.5">
              <IconBtn title="Overview" active={activePage === "overview"} onClick={() => onNavigate("overview")}>
                <LayoutDashboard className="w-4 h-4" />
              </IconBtn>
              <IconBtn title="Prompts" active={activePage === "prompts"} onClick={() => onNavigate("prompts")}>
                <MessageSquare className="w-4 h-4" />
              </IconBtn>
              <IconBtn title="Sources" active={activePage === "sources"} onClick={() => onNavigate("sources")}>
                <Globe className="w-4 h-4" />
              </IconBtn>

              <div className="w-5 border-t border-[#f0f0f0] my-1.5" />

              <IconBtn title="Reddit" active={activePage === "engagement-threads"} onClick={() => onNavigate("engagement-threads")}>
                <img src="https://www.google.com/s2/favicons?domain=reddit.com&sz=32" className="w-4 h-4 rounded-sm" alt="" />
              </IconBtn>

              <IconBtn title="Quora" active={activePage === "quora-threads"} onClick={() => onNavigate("quora-threads")}>
                <img src="https://www.google.com/s2/favicons?domain=quora.com&sz=32" className="w-4 h-4 rounded-sm" alt="" />
              </IconBtn>

              {demoMode ? (
                <IconBtn title={`Generate listicles, comparison pages & more for ${profile.brand_name}`} disabled>
                  <ListChecks className="w-4 h-4" />
                </IconBtn>
              ) : (
                <IconBtn title={`${profile.brand_name} Content`} active={isFixesActive} onClick={() => onNavigate("fixes:listicles")}>
                  <ListChecks className="w-4 h-4" />
                </IconBtn>
              )}

              <div className="w-5 border-t border-[#f0f0f0] my-1.5" />

              {demoMode ? (
                <>
                  <IconBtn title="Know exactly when AI crawls your website" disabled>
                    <Radio className="w-4 h-4" />
                  </IconBtn>
                  <IconBtn title="See exactly why AI recommended your competition" disabled>
                    <Swords className="w-4 h-4" />
                  </IconBtn>
                </>
              ) : (
                <>
                  <IconBtn title="Crawlers" active={activePage === "crawlers"} onClick={() => onNavigate("crawlers")}>
                    <Radio className="w-4 h-4" />
                  </IconBtn>
                  <IconBtn title="Competitor Playbook" active={activePage === "competitor-playbook"} onClick={() => onNavigate("competitor-playbook")}>
                    <Swords className="w-4 h-4" />
                  </IconBtn>
                </>
              )}

              <div className="w-5 border-t border-[#f0f0f0] my-1.5" />

              <IconBtn title="Brand" active={activePage === "brand"} onClick={() => onNavigate("brand")}>
                <Tag className="w-4 h-4" />
              </IconBtn>
            </div>

            {/* Footer — logo only */}
            <div className="py-3 flex items-center justify-center border-t border-[#f0f0f0]">
              <svg width="18" height="20" viewBox="0 0 100 110" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M50 4 C54 4 57 6 59.5 10 L93 68 C97 74 97 80 93.5 85 C90 90 84 93 77 93 L23 93 C16 93 10 90 6.5 85 C3 80 3 74 7 68 L40.5 10 C43 6 46 4 50 4Z" fill="#ede9fe" />
                <path d="M28 72 C32 62 44 56 58 60 C66 62.5 70 67 68 70 C66 73 60 72 52 69 C44 66 36 68 32 74 C30 77 28 75 28 72Z" fill="url(#swooshGradCollapsed)" />
                <defs>
                  <linearGradient id="swooshGradCollapsed" x1="28" y1="65" x2="70" y2="65" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#5b21b6" />
                    <stop offset="100%" stopColor="#a855f7" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12, ease: "easeInOut" }}
            className="flex flex-col h-full w-[220px]"
          >
            {/* Brand header */}
            <div className="px-3 pt-3 pb-3 border-b border-[#f0f0f0] flex items-center gap-2">
              <button className="flex-1 min-w-0 flex items-center gap-2.5 px-3 py-2 bg-white border border-[#e5e5e5] rounded-full shadow-sm hover:border-[#d0d0d0] transition-colors">
                <BrandFavicon domain={domain} name={profile.brand_name} size={22} />
                <span className="flex-1 min-w-0 text-[13px] font-semibold text-[#0a0a0a] truncate text-left">{profile.brand_name}</span>
                <ChevronsUpDown className="w-3.5 h-3.5 text-[#9ca3af] shrink-0" />
              </button>
              {onClose && (
                <button
                  onClick={onClose}
                  title="Collapse sidebar"
                  className="flex items-center justify-center w-7 h-7 rounded-md text-[#9ca3af] hover:text-[#5B2D91] hover:bg-[#f3eeff] transition-colors shrink-0"
                >
                  <PanelLeftClose className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Nav */}
            <div className="px-3 flex-1 overflow-y-auto py-4 space-y-5">

              {/* ANALYTICS */}
              <div>
                <SectionLabel>Analytics</SectionLabel>
                <NavItem active={activePage === "overview"} icon={LayoutDashboard} label="Overview" onClick={() => onNavigate("overview")} />
              </div>

              {/* AI VISIBILITY */}
              <div>
                <SectionLabel>AI Visibility</SectionLabel>
                <div className="space-y-0.5">
                  <NavItem active={activePage === "prompts"} icon={MessageSquare} label="Prompts" onClick={() => onNavigate("prompts")} />
                  <NavItem active={activePage === "sources"} icon={Globe} label="Sources" onClick={() => onNavigate("sources")} />
                </div>
              </div>

              {/* OPTIMIZE */}
              <div>
                <SectionLabel>Optimize</SectionLabel>
                <div className="space-y-0.5 mb-0.5">
                  <NavItem active={activePage === "engagement-threads"} imgSrc="https://www.google.com/s2/favicons?domain=reddit.com&sz=32" label="Reddit" onClick={() => onNavigate("engagement-threads")} />
                  <NavItem active={activePage === "quora-threads"} imgSrc="https://www.google.com/s2/favicons?domain=quora.com&sz=32" label="Quora" onClick={() => onNavigate("quora-threads")} />
                </div>
                {demoMode ? (
                  <>
                    <button
                      title={`Generate listicles, comparison pages & more for ${profile.brand_name}`}
                      onClick={() => setBrandContentOpen((v) => !v)}
                      className="relative w-full flex items-center gap-2.5 px-3 py-[7px] rounded-lg text-left text-[13px] font-medium text-[#6b7280] hover:bg-[#f7f7f5] hover:text-[#0a0a0a] transition-all"
                    >
                      <ListChecks className="w-4 h-4 shrink-0 text-[#9ca3af]" />
                      <span className="flex-1 truncate">{profile.brand_name} Content</span>
                      {brandContentOpen
                        ? <ChevronDown className="w-3.5 h-3.5 text-[#9ca3af]" />
                        : <ChevronRight className="w-3.5 h-3.5 text-[#9ca3af]" />
                      }
                    </button>
                    <AnimatePresence initial={false}>
                      {brandContentOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.15, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <div className="mt-0.5 space-y-0.5 pb-1">
                            {BRAND_CONTENT_ITEMS.map((item) => (
                              <LockedNavItem key={item.id} icon={ListChecks} label={item.label} indent />
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setBrandContentOpen((v) => !v)}
                      className={cn(
                        "relative w-full flex items-center gap-2.5 px-3 py-[7px] rounded-lg text-left text-[13px] font-medium transition-all",
                        isFixesActive ? "text-[#5B2D91]" : "text-[#6b7280] hover:bg-[#f7f7f5] hover:text-[#0a0a0a]"
                      )}
                    >
                      <ListChecks className={cn("w-4 h-4 shrink-0", isFixesActive ? "text-[#5B2D91]" : "text-[#9ca3af]")} />
                      <span className="flex-1 truncate">{profile.brand_name} Content</span>
                      {brandContentOpen
                        ? <ChevronDown className="w-3.5 h-3.5 text-[#9ca3af]" />
                        : <ChevronRight className="w-3.5 h-3.5 text-[#9ca3af]" />
                      }
                    </button>
                    <AnimatePresence initial={false}>
                      {brandContentOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.15, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <div className="mt-0.5 space-y-0.5 pb-1">
                            {BRAND_CONTENT_ITEMS.map((item) => (
                              <NavItem
                                key={item.id}
                                active={activePage === `fixes:${item.id}`}
                                icon={ListChecks}
                                label={item.label}
                                badge={item.badge}
                                indent
                                onClick={() => { onNavigate(`fixes:${item.id}`); setBrandContentOpen(true); }}
                              />
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                )}
              </div>

              {/* INTELLIGENCE */}
              <div>
                <SectionLabel>Intelligence</SectionLabel>
                <div className="space-y-0.5">
                  {demoMode ? (
                    <>
                      <LockedNavItem icon={Radio} label="Crawlers" title="Know exactly when AI crawls your website" />
                      <LockedNavItem icon={Swords} label="Competitor Playbook" title="See exactly why AI recommended your competition" />
                    </>
                  ) : (
                    <>
                      <NavItem active={activePage === "crawlers"} icon={Radio} label="Crawlers" onClick={() => onNavigate("crawlers")} />
                      <NavItem active={activePage === "competitor-playbook"} icon={Swords} label="Competitor Playbook" onClick={() => onNavigate("competitor-playbook")} />
                    </>
                  )}
                </div>
              </div>

              {/* Brand — separated */}
              <div className="pt-1 border-t border-[#f0f0f0]">
                <NavItem active={activePage === "brand"} icon={Tag} label="Brand" onClick={() => onNavigate("brand")} />
              </div>

            </div>

            {/* Footer */}
            <div className="px-3 pb-4 pt-3 border-t border-[#f0f0f0]">
              <div className="flex items-center gap-2.5 px-2 py-1.5">
                <svg width="22" height="24" viewBox="0 0 100 110" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
                  <path d="M50 4 C54 4 57 6 59.5 10 L93 68 C97 74 97 80 93.5 85 C90 90 84 93 77 93 L23 93 C16 93 10 90 6.5 85 C3 80 3 74 7 68 L40.5 10 C43 6 46 4 50 4Z" fill="#ede9fe" />
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
                  <p className="text-[11px] text-[#9ca3af] truncate">Pro plan</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 mt-2 px-2">
                <Clock className="w-3 h-3 text-[#5B2D91] shrink-0" />
                <span className="text-[11px] text-[#6b7280]">Next audit in</span>
                <span className="text-[11px] font-bold text-[#5B2D91]">20h 12m</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </aside>
  );
}
