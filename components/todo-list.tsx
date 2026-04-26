"use client";

import { useState } from "react";
import { BrandProfile } from "@/types";
import { Button } from "@/components/ui/button";
import { ExternalLink, FileText, Download, Loader2, CheckCircle2, Circle } from "lucide-react";

interface TodoItem {
  id: string;
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  action?: { label: string; type: "link" | "generate"; href?: string };
}

interface TodoListProps {
  profile: BrandProfile;
}

const IMPACT_STYLES = {
  high:   "bg-red-50 text-red-600 border-red-100",
  medium: "bg-amber-50 text-amber-600 border-amber-100",
  low:    "bg-gray-100 text-gray-500 border-gray-200",
};

export function TodoList({ profile }: TodoListProps) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [generatingLlms, setGeneratingLlms] = useState(false);

  const todos: TodoItem[] = [
    {
      id: "g2",
      title: "Add your brand to G2",
      description: "G2 is a major source for AI training data. A G2 listing increases your chances of being recommended by AI assistants.",
      impact: "high",
      action: { label: "Go to G2", type: "link", href: "https://www.g2.com/products/new" },
    },
    {
      id: "comparison",
      title: `Create a comparison page (${profile.brand_name} vs Competitor)`,
      description: "Head-to-head comparison pages rank highly in both search and AI responses. Create one for each major competitor.",
      impact: "high",
    },
    {
      id: "reddit",
      title: "Post on Reddit in your niche",
      description: "Reddit content is heavily indexed by AI systems. Share genuine value in subreddits your target users frequent.",
      impact: "medium",
      action: {
        label: "Browse subreddits",
        type: "link",
        href: `https://www.reddit.com/subreddits/search/?q=${encodeURIComponent(profile.category)}`,
      },
    },
    {
      id: "hero",
      title: "Improve your hero copy for AI",
      description: "AI systems parse your homepage to understand what you do. Make your headline and description crystal clear and keyword-rich.",
      impact: "medium",
    },
    {
      id: "llms",
      title: "Generate your llms.txt file",
      description: "llms.txt is a standard that helps AI models understand your website. Place it at yourdomain.com/llms.txt.",
      impact: "high",
      action: { label: "Generate llms.txt", type: "generate" },
    },
  ];

  async function handleGenerateLlms() {
    setGeneratingLlms(true);
    try {
      const res = await fetch("/api/generate-llms-txt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile }),
      });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "llms.txt";
      a.click();
      URL.revokeObjectURL(url);
      setChecked((p) => ({ ...p, llms: true }));
    } catch {
      alert("Failed to generate llms.txt.");
    } finally {
      setGeneratingLlms(false);
    }
  }

  const completedCount = Object.values(checked).filter(Boolean).length;

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">AI Visibility To-Do List</h3>
          <p className="text-xs text-gray-400 mt-0.5">Complete these to improve your score on the next audit.</p>
        </div>
        <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
          {completedCount}/{todos.length}
        </span>
      </div>

      <div className="divide-y divide-gray-50">
        {todos.map((todo) => (
          <div
            key={todo.id}
            className={`flex items-start gap-3 px-5 py-4 cursor-pointer group transition-colors hover:bg-gray-50 ${
              checked[todo.id] ? "opacity-50" : ""
            }`}
            onClick={() => setChecked((p) => ({ ...p, [todo.id]: !p[todo.id] }))}
          >
            <div className="shrink-0 mt-0.5">
              {checked[todo.id] ? (
                <CheckCircle2 className="w-4 h-4 text-green-500" />
              ) : (
                <Circle className="w-4 h-4 text-gray-300 group-hover:text-gray-400 transition-colors" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                <p className={`text-sm font-medium ${checked[todo.id] ? "line-through text-gray-400" : "text-gray-800"}`}>
                  {todo.title}
                </p>
                <span className={`text-xs font-medium px-1.5 py-0.5 rounded border ${IMPACT_STYLES[todo.impact]}`}>
                  {todo.impact}
                </span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">{todo.description}</p>
              {todo.action && (
                <div className="mt-2" onClick={(e) => e.stopPropagation()}>
                  {todo.action.type === "link" && todo.action.href ? (
                    <Button variant="outline" size="sm" className="h-7 text-xs"
                      onClick={() => window.open(todo.action!.href, "_blank")}>
                      <ExternalLink className="w-3 h-3 mr-1.5" />{todo.action.label}
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" className="h-7 text-xs"
                      onClick={handleGenerateLlms} disabled={generatingLlms}>
                      {generatingLlms ? (
                        <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                      ) : checked[todo.id] ? (
                        <Download className="w-3 h-3 mr-1.5 text-green-500" />
                      ) : (
                        <FileText className="w-3 h-3 mr-1.5" />
                      )}
                      {generatingLlms ? "Generating..." : checked[todo.id] ? "Download again" : todo.action.label}
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
