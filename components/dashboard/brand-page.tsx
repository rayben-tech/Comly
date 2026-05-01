"use client";

import { useState } from "react";
import { BrandProfile } from "@/types";
import { Pencil, X, Check, Plus } from "lucide-react";

function domainFromUrl(url: string): string {
  if (!url) return "";
  try {
    const u = url.startsWith("http") ? url : "https://" + url;
    return new URL(u).hostname;
  } catch {
    return url.toLowerCase().replace(/\s+/g, "").replace(/[^a-z0-9.]/g, "") + ".com";
  }
}

function BrandFaviconLarge({ domain, name }: { domain: string; name: string }) {
  const [err, setErr] = useState(false);
  if (err || !domain) {
    return (
      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#5B2D91] to-[#8B5CF6] flex items-center justify-center text-white font-bold text-xl shrink-0 shadow-sm">
        {name.charAt(0).toUpperCase()}
      </div>
    );
  }
  return (
    <img
      src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`}
      alt={name}
      width={48}
      height={48}
      className="w-12 h-12 rounded-2xl object-contain shrink-0"
      onError={() => setErr(true)}
    />
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold text-[#aaaaaa] uppercase tracking-wide mb-1.5">
      {children}
    </p>
  );
}


function TextInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2.5 bg-white border border-[#d5d5d5] focus:border-[#5B2D91] rounded-lg text-[13px] text-[#0a0a0a] outline-none transition-colors"
    />
  );
}

function TextareaInput({
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full px-3 py-2.5 bg-white border border-[#d5d5d5] focus:border-[#5B2D91] rounded-lg text-[13px] text-[#0a0a0a] outline-none transition-colors resize-none leading-relaxed"
    />
  );
}

function TagEditor({
  tags,
  onChange,
  placeholder,
}: {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}) {
  const [input, setInput] = useState("");

  function add() {
    const trimmed = input.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
    }
    setInput("");
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5 min-h-[32px]">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 text-[12px] font-medium px-2.5 py-1 rounded-full bg-[#f7f7f5] border border-[#e5e5e5] text-[#6b6b6b]"
          >
            {tag}
            <button
              type="button"
              onClick={() => onChange(tags.filter((t) => t !== tag))}
              className="text-[#aaaaaa] hover:text-[#ef4444] transition-colors ml-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
          placeholder={placeholder ?? "Add item…"}
          className="flex-1 px-3 py-2 bg-white border border-[#d5d5d5] focus:border-[#5B2D91] rounded-lg text-[13px] text-[#0a0a0a] outline-none transition-colors"
        />
        <button
          type="button"
          onClick={add}
          className="px-3 py-2 bg-[#f7f7f5] border border-[#e5e5e5] rounded-lg text-[#6b6b6b] hover:bg-[#eeeeed] transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function PricingEditor({
  tiers,
  onChange,
}: {
  tiers: { plan: string; price: string }[];
  onChange: (tiers: { plan: string; price: string }[]) => void;
}) {
  function update(i: number, field: "plan" | "price", value: string) {
    const next = tiers.map((t, idx) => idx === i ? { ...t, [field]: value } : t);
    onChange(next);
  }
  function remove(i: number) {
    onChange(tiers.filter((_, idx) => idx !== i));
  }
  function add() {
    onChange([...tiers, { plan: "", price: "" }]);
  }

  return (
    <div className="space-y-2">
      {tiers.map((tier, i) => (
        <div key={i} className="flex gap-2 items-center">
          <input
            type="text"
            value={tier.plan}
            onChange={(e) => update(i, "plan", e.target.value)}
            placeholder="Plan name"
            className="flex-1 px-3 py-2 bg-white border border-[#d5d5d5] focus:border-[#5B2D91] rounded-lg text-[13px] text-[#0a0a0a] outline-none transition-colors"
          />
          <input
            type="text"
            value={tier.price}
            onChange={(e) => update(i, "price", e.target.value)}
            placeholder="Price"
            className="w-28 px-3 py-2 bg-white border border-[#d5d5d5] focus:border-[#5B2D91] rounded-lg text-[13px] text-[#0a0a0a] outline-none transition-colors"
          />
          <button
            type="button"
            onClick={() => remove(i)}
            className="text-[#aaaaaa] hover:text-[#ef4444] transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="flex items-center gap-1.5 text-[12px] font-medium text-[#5B2D91] hover:text-[#4a2478] transition-colors"
      >
        <Plus className="w-3.5 h-3.5" />
        Add tier
      </button>
    </div>
  );
}

interface Props {
  profile: BrandProfile;
  onSave?: (profile: BrandProfile) => void;
}

export function BrandPage({ profile, onSave }: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<BrandProfile>(profile);
  const domain = domainFromUrl(editing ? draft.url : profile.url || "");

  function startEdit() {
    setDraft(profile);
    setEditing(true);
  }

  function cancel() {
    setDraft(profile);
    setEditing(false);
  }

  function save() {
    onSave?.(draft);
    setEditing(false);
  }

  function set<K extends keyof BrandProfile>(key: K, value: BrandProfile[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  const displayDomain = domainFromUrl(profile.url || "");

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-base font-semibold text-[#0a0a0a]">Brand Profile</h2>
          <p className="text-[13px] text-[#6b6b6b] mt-0.5">
            Your brand information used to generate the audit
          </p>
        </div>
        {!editing ? (
          <button
            onClick={startEdit}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#e5e5e5] text-[13px] font-medium text-[#6b6b6b] hover:bg-[#f7f7f5] hover:text-[#0a0a0a] transition-all"
          >
            <Pencil className="w-3.5 h-3.5" />
            Edit
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={cancel}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#e5e5e5] text-[13px] font-medium text-[#6b6b6b] hover:bg-[#f7f7f5] transition-all"
            >
              <X className="w-3.5 h-3.5" />
              Cancel
            </button>
            <button
              onClick={save}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#5B2D91] text-[13px] font-medium text-white hover:bg-[#4a2478] transition-all"
            >
              <Check className="w-3.5 h-3.5" />
              Save
            </button>
          </div>
        )}
      </div>

      <div className="bg-white border border-[#e5e5e5] rounded-2xl p-5 space-y-4">
        {/* Identity header */}
        <div className="flex items-center gap-3 pb-4 border-b border-[#f0f0f0]">
          <BrandFaviconLarge domain={editing ? domain : displayDomain} name={editing ? draft.brand_name : profile.brand_name} />
          {editing ? (
            <div className="flex-1 space-y-2">
              <TextInput
                value={draft.brand_name}
                onChange={(v) => set("brand_name", v)}
                placeholder="Brand name"
              />
              <TextInput
                value={draft.url}
                onChange={(v) => set("url", v)}
                placeholder="Website URL"
              />
            </div>
          ) : (
            <div>
              <p className="text-[17px] font-bold text-[#0a0a0a] leading-tight">{profile.brand_name}</p>
              {displayDomain && <p className="text-[13px] text-[#aaaaaa] mt-0.5">{displayDomain}</p>}
            </div>
          )}
        </div>

        {/* Description */}
        <div>
          <FieldLabel>Description</FieldLabel>
          {editing ? (
            <TextareaInput
              value={draft.description}
              onChange={(v) => set("description", v)}
              placeholder="Describe your brand…"
            />
          ) : profile.description ? (
            <div className="px-3 py-2.5 bg-[#f7f7f5] border border-[#e5e5e5] rounded-lg text-[13px] text-[#0a0a0a]">
              <span className="leading-relaxed">{profile.description}</span>
            </div>
          ) : null}
        </div>

        {/* Category + URL (read-only mode shows URL here; edit mode shows it in header) */}
        {editing ? (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <FieldLabel>Category</FieldLabel>
              <TextInput value={draft.category} onChange={(v) => set("category", v)} placeholder="e.g. SaaS, eCommerce" />
            </div>
            <div>
              <FieldLabel>Target users</FieldLabel>
              <TextInput value={draft.target_users} onChange={(v) => set("target_users", v)} placeholder="Who is this for?" />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {profile.category && (
              <div>
                <FieldLabel>Category</FieldLabel>
                <div className="px-3 py-2.5 bg-[#f7f7f5] border border-[#e5e5e5] rounded-lg text-[13px] text-[#0a0a0a] min-h-[38px]">
                  <span>{profile.category}</span>
                </div>
              </div>
            )}
            {profile.url && (
              <div>
                <FieldLabel>Website</FieldLabel>
                <div className="px-3 py-2.5 bg-[#f7f7f5] border border-[#e5e5e5] rounded-lg text-[13px] min-h-[38px]">
                  <span className="text-[#5B2D91] truncate">{displayDomain || profile.url}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Target users (read-only, edit mode moved above) */}
        {!editing && profile.target_users && (
          <div>
            <FieldLabel>Target users</FieldLabel>
            <div className="px-3 py-2.5 bg-[#f7f7f5] border border-[#e5e5e5] rounded-lg text-[13px] text-[#0a0a0a] min-h-[38px]">
              <span>{profile.target_users}</span>
            </div>
          </div>
        )}

        {/* Use cases */}
        <div>
          <FieldLabel>Use cases</FieldLabel>
          {editing ? (
            <TagEditor
              tags={draft.main_use_cases ?? []}
              onChange={(v) => set("main_use_cases", v)}
              placeholder="Add use case…"
            />
          ) : (
            profile.main_use_cases?.length > 0 ? (
              <div className="px-3 py-2.5 bg-[#f7f7f5] border border-[#e5e5e5] rounded-lg flex items-start flex-wrap gap-1.5 min-h-[38px]">
                {profile.main_use_cases.map((u) => (
                  <span key={u} className="inline-flex items-center text-[12px] font-medium px-2.5 py-1 rounded-full bg-white border border-[#e5e5e5] text-[#6b6b6b]">
                    {u}
                  </span>
                ))}
              </div>
            ) : null
          )}
        </div>

        {/* Competitors */}
        <div>
          <FieldLabel>Competitors</FieldLabel>
          {editing ? (
            <TagEditor
              tags={draft.competitors ?? []}
              onChange={(v) => set("competitors", v)}
              placeholder="Add competitor…"
            />
          ) : (
            profile.competitors?.length > 0 ? (
              <div className="px-3 py-2.5 bg-[#f7f7f5] border border-[#e5e5e5] rounded-lg flex items-start flex-wrap gap-1.5 min-h-[38px]">
                {profile.competitors.map((c) => (
                  <span key={c} className="inline-flex items-center text-[12px] font-medium px-2.5 py-1 rounded-full bg-white border border-[#e5e5e5] text-[#6b6b6b]">
                    {c}
                  </span>
                ))}
              </div>
            ) : null
          )}
        </div>

        {/* Differentiators */}
        <div>
          <FieldLabel>Differentiators</FieldLabel>
          {editing ? (
            <TextareaInput
              value={draft.differentiators}
              onChange={(v) => set("differentiators", v)}
              placeholder="What sets your brand apart?"
            />
          ) : profile.differentiators ? (
            <div className="px-3 py-2.5 bg-[#f7f7f5] border border-[#e5e5e5] rounded-lg text-[13px] text-[#0a0a0a]">
              <span className="leading-relaxed">{profile.differentiators}</span>
            </div>
          ) : null}
        </div>

        {/* Pricing */}
        <div>
          <FieldLabel>Pricing</FieldLabel>
          {editing ? (
            <PricingEditor
              tiers={draft.pricing_tiers ?? []}
              onChange={(v) => set("pricing_tiers", v)}
            />
          ) : (
            profile.pricing_tiers?.length > 0 ? (
              <div className="px-3 py-2.5 bg-[#f7f7f5] border border-[#e5e5e5] rounded-lg flex items-start flex-wrap gap-1.5 min-h-[38px]">
                {profile.pricing_tiers.map((t, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 text-[12px] font-medium px-2.5 py-1 rounded-full bg-white border border-[#e5e5e5] text-[#6b6b6b]">
                    <span>{t.plan}</span>
                    {t.price && <span className="text-[#5B2D91] font-semibold">{t.price}</span>}
                  </span>
                ))}
              </div>
            ) : null
          )}
        </div>
      </div>
    </div>
  );
}
