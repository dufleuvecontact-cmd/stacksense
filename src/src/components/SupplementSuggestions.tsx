"use client";

import React, { useState, useMemo } from "react";
import { useApp } from "@/lib/store";
import { getSuggestions, getSymptomAverages } from "@/lib/suggestions";
import type { Suggestion } from "@/lib/suggestions";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Zap, Brain, Eye, BedDouble, TrendingDown, Plus,
  ChevronDown, ChevronUp, Sparkles, AlertCircle, Info,
} from "lucide-react";
import { toast } from "sonner";

const domainIcons: Record<string, React.ElementType> = {
  energy: Zap,
  mood: Brain,
  focus: Eye,
  sleep: BedDouble,
};

const domainColors: Record<string, string> = {
  energy: "text-amber-500",
  mood: "text-violet-500",
  focus: "text-sky-500",
  sleep: "text-indigo-500",
};

const priorityStyles: Record<string, string> = {
  high: "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-100 dark:border-red-800/30",
  medium: "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-800/30",
  low: "bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400 border-zinc-100 dark:border-zinc-700",
};

const categoryColors: Record<string, string> = {
  Supplement: "bg-teal/10 text-teal dark:bg-teal/20",
  Peptide: "bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400",
  Compound: "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400",
};

function ScoreBar({ label, value, icon: Icon, color }: { label: string; value: number; icon: React.ElementType; color: string }) {
  const pct = (value / 10) * 100;
  const barColor =
    value <= 3 ? "bg-red-400" :
    value <= 5 ? "bg-amber-400" :
    value <= 7 ? "bg-teal" : "bg-emerald-400";

  return (
    <div className="flex items-center gap-2">
      <Icon className={`w-3.5 h-3.5 shrink-0 ${color}`} />
          <span className="text-[10px] font-medium uppercase text-zinc-400 w-10 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${pct}%` }} />
      </div>
      <span className={`text-[11px] font-bold w-6 text-right ${color}`}>{value.toFixed(1)}</span>
    </div>
  );
}

function SuggestionCard({ suggestion, onAddToStack }: { suggestion: Suggestion; onAddToStack: (s: Suggestion) => void }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`rounded-2xl border p-4 transition-all ${priorityStyles[suggestion.priority]}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-semibold text-sm text-zinc-900 dark:text-white truncate">
              {suggestion.name}
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${categoryColors[suggestion.category]}`}>
              {suggestion.category}
            </span>
          </div>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
            Suggested dose: <span className="text-zinc-700 dark:text-zinc-300">{suggestion.dose}</span>
          </p>
        </div>
        <button
          onClick={() => setExpanded(e => !e)}
          className="shrink-0 p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
        >
          {expanded ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
        </button>
      </div>

      {/* Tags */}
      <div className="flex gap-1.5 flex-wrap mt-2">
        {suggestion.tags.slice(0, 4).map(tag => {
          const Icon = domainIcons[tag];
          return (
            <span key={tag} className="flex items-center gap-1 text-[10px] bg-white/60 dark:bg-black/20 px-2 py-0.5 rounded-full text-zinc-500 dark:text-zinc-400 font-medium">
              {Icon && <Icon className={`w-2.5 h-2.5 ${domainColors[tag] || ""}`} />}
              {tag}
            </span>
          );
        })}
      </div>

      {/* Expanded reason */}
      {expanded && (
        <div className="mt-3 space-y-3">
          <div className="flex gap-2 bg-white/50 dark:bg-black/20 rounded-xl p-3">
            <Info className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
            <p className="text-[11px] text-zinc-600 dark:text-zinc-300 leading-relaxed">{suggestion.reason}</p>
          </div>
          <Button
            size="sm"
            onClick={() => onAddToStack(suggestion)}
            className="w-full h-8 bg-teal hover:bg-teal/90 text-white text-xs font-medium rounded-xl"
          >
            <Plus className="w-3 h-3 mr-1.5" />
            Add to Stack
          </Button>
        </div>
      )}
    </div>
  );
}

export function SupplementSuggestions() {
  const { state, dispatch } = useApp();
  const { symptomLogs, profile } = state;
  const [showAll, setShowAll] = useState(false);

  const currentStackNames = useMemo(
    () => profile.currentStack.map(i => i.name),
    [profile.currentStack]
  );

  const suggestions = useMemo(
    () => getSuggestions(symptomLogs, currentStackNames),
    [symptomLogs, currentStackNames]
  );

  const avgs = useMemo(() => getSymptomAverages(symptomLogs), [symptomLogs]);

  const handleAddToStack = (s: Suggestion) => {
    dispatch({
      type: "ADD_STACK_ITEM",
      payload: {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        name: s.name,
        category: s.category,
        form: "Capsule",
        defaultDose: s.dose.split(" ")[0],
        unit: s.dose.split(" ")[1] || "mg",
        schedule: { days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], times: ["Morning"] },
        active: true,
      },
    });
    toast.success(`${s.name} added to your stack`);
  };

  if (symptomLogs.length < 2) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-700 p-5 text-center">
        <Sparkles className="w-6 h-6 text-zinc-300 dark:text-zinc-600 mx-auto mb-2" />
        <p className="text-sm font-semibold text-zinc-400 dark:text-zinc-500">Log symptoms to unlock suggestions</p>
        <p className="text-xs text-zinc-400 dark:text-zinc-600 mt-1">Track Energy, Mood, Focus or Sleep — we'll recommend targeted supplements based on your data.</p>
      </div>
    );
  }

  if (suggestions.length === 0) {
    return (
      <div className="rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-emerald-50 dark:bg-emerald-900/20 p-5 text-center">
        <AlertCircle className="w-5 h-5 text-emerald-500 mx-auto mb-2" />
        <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">All scores look good!</p>
        <p className="text-xs text-emerald-600/70 dark:text-emerald-400/60 mt-1">Your symptom averages are healthy. Keep logging to track changes.</p>
      </div>
    );
  }

  const displayed = showAll ? suggestions : suggestions.slice(0, 3);

  return (
    <div className="space-y-3">
      {/* Symptom averages summary */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-4 space-y-2.5">
        <div className="flex items-center gap-1.5 mb-3">
          <TrendingDown className="w-3.5 h-3.5 text-zinc-400" />
          <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">Your averages ({symptomLogs.length} logs)</span>
        </div>
        {(["Energy", "Mood", "Focus", "Sleep"] as const).map(type => {
          const val = avgs[type];
          if (val === undefined) return null;
          const Icon = domainIcons[type.toLowerCase()];
          return (
            <ScoreBar
              key={type}
              label={type}
              value={val}
              icon={Icon}
              color={domainColors[type.toLowerCase()]}
            />
          );
        })}
      </div>

      {/* Suggestion cards */}
      <div className="space-y-2">
        {displayed.map(s => (
          <SuggestionCard key={s.name} suggestion={s} onAddToStack={handleAddToStack} />
        ))}
      </div>

      {suggestions.length > 3 && (
        <button
          onClick={() => setShowAll(v => !v)}
          className="w-full text-xs font-medium text-teal py-2 rounded-xl hover:bg-teal/5 dark:hover:bg-teal/10 transition-colors"
        >
          {showAll ? "Show less" : `Show ${suggestions.length - 3} more suggestions`}
        </button>
      )}

      <p className="text-[10px] text-center text-zinc-400 dark:text-zinc-600 px-2">
        Suggestions are based on your logged symptom patterns and are not medical advice.
      </p>
    </div>
  );
}
