"use client";

import React, { useState, useRef, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useSubscriptionContext as useSubscription } from "@/hooks/SubscriptionContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FlaskConical,
  Upload,
  Loader2,
  ShieldCheck,
  Sparkles,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Clock,
  Lock,
  Trash2,
  MessageCircle,
  Bot,
} from "lucide-react";
import { toast } from "sonner";

type Analysis = {
  id: string;
  summary: string;
  key_findings: string[];
  questions_for_doctor: string[];
  disclaimer: string;
  analysis_date: string;
  raw_markers: { name: string; value: number; unit: string }[];
};

export function BloodworkAnalysisCard({
  onShowPricing,
}: {
  onShowPricing?: () => void;
}) {
  const { isPremium, userId } = useSubscription();
  const fileRef = useRef<HTMLInputElement>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [freeUsed, setFreeUsed] = useState(0);
  const FREE_QUOTA = 2;

  useEffect(() => {
    if (!userId) return;
    loadHistory();
    loadFreeUsed();
  }, [userId]);

  const loadHistory = async () => {
    if (!userId) return;
    setLoadingHistory(true);
    try {
      const res = await fetch(`/api/bloodwork/history?userId=${userId}`);
      const data = await res.json();
      if (data.analyses) setAnalyses(data.analyses);
    } catch {
      /* silent */
    } finally {
      setLoadingHistory(false);
    }
  };

  const loadFreeUsed = async () => {
    if (!userId) return;
    const { data } = await supabase
      .from("profiles")
      .select("free_analyses_used")
      .eq("id", userId)
      .single();
    if (data) setFreeUsed(data.free_analyses_used ?? 0);
  };

  /**
   * Stub text extractor — reads a File and returns its text content.
   * For real PDFs you'd integrate pdf.js or a server-side extraction endpoint.
   * For now we return a placeholder so the AI still gets the markers from the form.
   * MARK: replace this with a proper PDF parser (pdf-parse, pdf.js, etc.)
   */
  const extractTextFromFile = async (file: File): Promise<string> => {
    if (file.type === "text/plain") {
      return await file.text();
    }
    // For PDF: stub — real implementation should call a parse endpoint
    return `[PDF file: ${file.name} — text extraction not yet implemented. Analysis will use manually entered markers only.]`;
  };

  const handleFileAnalyze = async (file: File) => {
    if (!userId) {
      toast.error("Please sign in first");
      return;
    }

    if (!isPremium && freeUsed >= FREE_QUOTA) {
      toast.error(`Free quota reached (${FREE_QUOTA} analyses). Upgrade to Premium for unlimited.`);
      onShowPricing?.();
      return;
    }

    setAnalyzing(true);
    try {
      const rawText = await extractTextFromFile(file);

      const res = await fetch("/api/bloodwork/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          isPremium,
          date: new Date().toISOString().split("T")[0],
          rawText,
          userContext: {},
        }),
      });

      const data = await res.json();

      if (res.status === 402) {
        toast.error(data.message || "Free quota exceeded");
        onShowPricing?.();
        return;
      }

      if (!res.ok || data.error) {
        throw new Error(data.error || "Analysis failed");
      }

      const newAnalysis: Analysis = {
        id: data.id || String(Date.now()),
        summary: data.summary,
        key_findings: data.keyFindings ?? [],
        questions_for_doctor: data.questionsForDoctor ?? [],
        disclaimer: data.disclaimer,
        analysis_date: new Date().toISOString(),
        raw_markers: [],
      };

      setAnalyses((prev) => [newAnalysis, ...prev]);
      setExpanded(newAnalysis.id);
      if (!isPremium) setFreeUsed((u) => u + 1);
      toast.success("Bloodwork analyzed successfully");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Analysis failed";
      toast.error(msg);
    } finally {
      setAnalyzing(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const canAnalyze = isPremium || freeUsed < FREE_QUOTA;
  const remainingFree = Math.max(0, FREE_QUOTA - freeUsed);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FlaskConical className="w-4 h-4 text-teal" />
          <p className="text-sm font-semibold dark:text-white">Bloodwork Analysis <span className="text-[10px] text-zinc-400 font-normal">(Beta)</span></p>
        </div>
        <Badge variant="outline" className="text-[9px] font-semibold border-teal/30 text-teal uppercase tracking-wider flex items-center gap-1">
          <ShieldCheck className="w-2.5 h-2.5" /> Encrypted
        </Badge>
      </div>

      {/* Upload card — locked: In Development */}
      <Card className="p-4 bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 rounded-xl overflow-hidden relative">
        {/* Locked overlay */}
        <div className="absolute inset-0 bg-white/60 dark:bg-zinc-900/70 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center gap-3 rounded-xl">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shadow-sm">
            <Bot className="w-6 h-6 text-slate-400 dark:text-slate-500" />
          </div>
          <div className="text-center space-y-1 px-4">
            <p className="text-sm font-bold dark:text-white">AI Marker Analysis</p>
            <p className="text-[11px] text-muted-foreground leading-snug">
              Automated bloodwork interpretation is being built and will be available soon.
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-100 dark:border-amber-900/40">
            <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
            <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wide">In Development</span>
          </div>
        </div>

        {/* Background content (blurred behind overlay) */}
        <div className="flex items-start gap-3 pointer-events-none select-none">
          <div className="w-10 h-10 bg-teal/10 dark:bg-teal/20 rounded-2xl flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-teal" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm dark:text-zinc-100">AI Biomarker Analysis</p>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
              Upload your bloodwork PDF or text file for a plain-language breakdown of your results.
            </p>
          </div>
        </div>
        <div className="mt-4 h-12 bg-zinc-200 dark:bg-zinc-700 rounded-2xl pointer-events-none select-none" />
      </Card>

      {/* History */}
      <div className="space-y-3">
        <h4 className="text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-400">
          Past Analyses ({loadingHistory ? "…" : analyses.length})
        </h4>

        {loadingHistory ? (
          <div className="flex justify-center py-6">
            <Loader2 className="w-5 h-5 animate-spin text-zinc-300" />
          </div>
        ) : analyses.length === 0 ? (
          <div className="p-8 text-center bg-zinc-50 dark:bg-zinc-900/50 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800">
            <FlaskConical className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
            <p className="text-xs text-zinc-500">No analyses yet.</p>
            <p className="text-[10px] text-zinc-400 mt-1">Upload a bloodwork file above to get started.</p>
          </div>
        ) : (
          analyses.map((a) => (
            <AnalysisCard
              key={a.id}
              analysis={a}
              expanded={expanded === a.id}
              onToggle={() => setExpanded(expanded === a.id ? null : a.id)}
            />
          ))
        )}
      </div>

      {/* Disclaimer */}
      <p className="text-[10px] text-center text-zinc-400 italic px-2 pb-4">
        NOT MEDICAL ADVICE — Results are AI-generated for informational purposes only.
        Always consult a qualified physician before making health decisions.
      </p>
    </div>
  );
}

function AnalysisCard({
  analysis,
  expanded,
  onToggle,
}: {
  analysis: Analysis;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <Card className="bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 rounded-2xl overflow-hidden">
      {/* Header row */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center shrink-0">
            <FlaskConical className="w-4 h-4 text-blue-500" />
          </div>
          <div>
            <p className="font-bold text-sm dark:text-zinc-200">AI Analysis</p>
            <div className="flex items-center gap-1 text-[10px] text-zinc-400">
              <Clock className="w-3 h-3" />
              {new Date(analysis.analysis_date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </div>
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-zinc-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-zinc-400" />
        )}
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="px-4 pb-5 space-y-4 border-t border-zinc-100 dark:border-zinc-800 pt-4">
          {/* Summary */}
          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Summary</p>
            <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">{analysis.summary}</p>
          </div>

          {/* Key findings */}
          {analysis.key_findings?.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Key Findings</p>
              <div className="space-y-1.5">
                {analysis.key_findings.map((f, i) => (
                  <div key={i} className="flex items-start gap-2 p-2.5 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
                    <div className="w-1.5 h-1.5 rounded-full bg-teal mt-1.5 shrink-0" />
                    <p className="text-[11px] text-zinc-600 dark:text-zinc-300 leading-snug">{f}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Questions for doctor */}
          {analysis.questions_for_doctor?.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <MessageCircle className="w-3.5 h-3.5 text-teal" />
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Ask Your Doctor</p>
              </div>
              <div className="space-y-1.5">
                {analysis.questions_for_doctor.map((q, i) => (
                  <div key={i} className="flex items-start gap-2 p-2.5 bg-teal/5 dark:bg-teal/10 rounded-xl border border-teal/10">
                    <span className="text-[10px] font-black text-teal mt-0.5">{i + 1}.</span>
                    <p className="text-[11px] text-zinc-700 dark:text-zinc-300 leading-snug">{q}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Disclaimer */}
          <div className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-xl border border-amber-100 dark:border-amber-900/30 flex items-start gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
            <p className="text-[10px] text-amber-700 dark:text-amber-400 leading-relaxed">
              {analysis.disclaimer}
            </p>
          </div>
        </div>
      )}
    </Card>
  );
}
