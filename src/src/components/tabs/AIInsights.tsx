"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bot, ExternalLink, Search, Newspaper, Loader2, Zap } from "lucide-react";
import { motion } from "framer-motion";

interface ResearchItem {
  id: string;
  type: 'topic' | 'news';
  title: string;
  description: string;
  source_url: string;
  tags: string[];
}

export function AIInsights({ onShowPricing }: { onShowPricing?: () => void }) {
  const [researchData, setResearchData] = useState<ResearchItem[]>([]);
  const [isLoadingResearch, setIsLoadingResearch] = useState(true);

  useEffect(() => {
    fetch('/api/research')
      .then(r => r.json())
      .then(d => { if (d.research) setResearchData(d.research); })
      .catch(console.error)
      .finally(() => setIsLoadingResearch(false));
  }, []);

  const openSource = (url: string) => {
    window.parent.postMessage({ type: "OPEN_EXTERNAL_URL", data: { url } }, "*");
  };

  const topics = researchData.filter(r => r.type === 'topic');
  const news = researchData.filter(r => r.type === 'news');

  return (
    <div className="flex flex-col h-full bg-[#f8fafc] dark:bg-slate-950 pt-[env(safe-area-inset-top,0px)]">
      {/* Header */}
      <div className="p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shrink-0 flex items-center gap-3">
        <div className="w-9 h-9 bg-teal/10 dark:bg-teal/20 rounded-xl flex items-center justify-center text-teal shadow-inner">
          <Bot className="w-5 h-5" />
        </div>
        <div>
            <h1 className="text-sm font-semibold dark:text-white flex items-center gap-2">
              Bio-Intelligence
              <Badge variant="outline" className="text-[8px] h-4 px-1.5 border-amber-300 text-amber-600 font-medium uppercase tracking-wide bg-amber-50 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-700">
                In Development
              </Badge>
            </h1>
            <p className="text-[10px] text-muted-foreground">AI assistant — coming soon</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5 pb-6">
        {/* In Development Banner */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm"
        >
          <div className="h-1.5 w-full bg-gradient-to-r from-teal via-emerald-400 to-teal/60" />
          <div className="p-6 flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <Bot className="w-8 h-8 text-slate-400 dark:text-slate-500" />
            </div>
            <div className="space-y-1.5">
              <h2 className="font-semibold text-base dark:text-white">AI Chat — In Development</h2>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
                The Bio-Intelligence assistant is being built. It will let you ask questions about your stack, protocols, and compounds.
              </p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-100 dark:border-amber-900/40">
                <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                <span className="text-xs font-medium text-amber-700 dark:text-amber-400">Coming soon</span>
            </div>
          </div>
        </motion.div>

        {/* Research Discovery Feed */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-medium text-[10px] uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
              <Search className="w-3.5 h-3.5" /> Discovery Feed
            </h3>
            <span className="text-[8px] font-medium text-teal/50 uppercase">Live</span>
          </div>

          {isLoadingResearch ? (
            <div className="grid grid-cols-1 gap-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-20 bg-slate-100 dark:bg-slate-900 animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-3">
                {topics.slice(0, 2).map((topic) => (
                  <Card
                    key={topic.id}
                    onClick={() => openSource(topic.source_url)}
                    className="p-4 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-all group hover:border-teal/50 cursor-pointer active:scale-[0.98]"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex flex-wrap gap-1">
                    {topic.tags.map(t => (
                        <Badge key={t} className="text-[8px] bg-teal/5 text-teal border-none font-medium uppercase h-4">{t}</Badge>
                      ))}
                      </div>
                      <Zap className="w-3 h-3 text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <h4 className="font-semibold text-sm dark:text-white mb-1">{topic.title}</h4>
                    <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">{topic.description}</p>
                  </Card>
                ))}
              </div>

              <div className="space-y-2">
                {news.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    onClick={() => openSource(item.source_url)}
                    className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 transition-all hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-8 h-8 rounded-lg bg-teal/5 flex items-center justify-center shrink-0">
                        <Newspaper className="w-4 h-4 text-teal" />
                      </div>
                      <div className="overflow-hidden">
                        <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block truncate">{item.title}</span>
                          <span className="text-[9px] text-slate-400 font-medium uppercase tracking-tighter">Research</span>
                      </div>
                    </div>
                    <ExternalLink className="w-3 h-3 text-slate-300" />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
